import Tesseract from 'tesseract.js';

/**
 * Extrait le numéro RIB (20 chiffres) d'une image
 * @param {File} imageFile - Fichier image uploadé
 * @returns {Promise<{success: boolean, rib?: string, error?: string}>}
 */
export async function extractRIBFromImage(imageFile) {
  try {
    // Vérification du type de fichier
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(imageFile.type)) {
      return {
        success: false,
        error: 'Format d\'image non supporté. Utilisez JPG, PNG ou WEBP.'
      };
    }

    // Vérification de la taille (max 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      return {
        success: false,
        error: 'L\'image est trop grande. Maximum 10MB.'
      };
    }

    // Prétraitement de l'image pour améliorer l'OCR
    const preprocessedImage = await preprocessImage(imageFile);

    // Extraction du texte avec Tesseract (français + anglais pour meilleure reconnaissance)
    const result = await Tesseract.recognize(preprocessedImage, 'fra+eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`Progression: ${Math.round(m.progress * 100)}%`);
        }
      },
      tessedit_char_whitelist: '0123456789 -', // Optimisé pour les chiffres
      tessedit_pageseg_mode: Tesseract.PSM.AUTO,
    });

    const extractedText = result.data.text;
    console.log('Texte extrait:', extractedText);

    // Stratégie 1: Recherche du RIB (20 chiffres consécutifs)
    const ribPattern = /\b\d{20}\b/g;
    const matches = extractedText.match(ribPattern);

    if (matches && matches.length > 0) {
      const rib = matches[0];
      console.log('RIB trouvé (méthode 1):', rib);
      return {
        success: true,
        rib: rib,
        confidence: result.data.confidence,
        method: 'direct'
      };
    }

    // Stratégie 2: Recherche de 20 chiffres avec espaces/tirets possibles
    const ribPatternWithSpaces = /\b\d[\d\s\-]{18,30}\d\b/g;
    const matchesWithSpaces = extractedText.match(ribPatternWithSpaces);
    
    if (matchesWithSpaces) {
      for (let match of matchesWithSpaces) {
        const cleanedRib = match.replace(/[\s\-]/g, '');
        if (cleanedRib.length === 20 && /^\d{20}$/.test(cleanedRib)) {
          console.log('RIB trouvé (méthode 2):', cleanedRib);
          return {
            success: true,
            rib: cleanedRib,
            confidence: result.data.confidence,
            method: 'cleaned'
          };
        }
      }
    }

    // Stratégie 3: Recherche par mots-clés "RIB" suivis de chiffres
    const ribKeywordPattern = /(?:RIB|R\.I\.B|rib)[\s:]*(\d[\d\s\-]{18,30}\d)/gi;
    const keywordMatches = extractedText.match(ribKeywordPattern);
    
    if (keywordMatches) {
      for (let match of keywordMatches) {
        const numbers = match.replace(/[^\d]/g, '');
        if (numbers.length === 20) {
          console.log('RIB trouvé (méthode 3):', numbers);
          return {
            success: true,
            rib: numbers,
            confidence: result.data.confidence,
            method: 'keyword'
          };
        }
      }
    }

    // Stratégie 4: Recherche de lignes contenant exactement 20 chiffres
    const lines = extractedText.split('\n');
    for (let line of lines) {
      const digits = line.replace(/[^\d]/g, '');
      if (digits.length === 20) {
        console.log('RIB trouvé (méthode 4):', digits);
        return {
          success: true,
          rib: digits,
          confidence: result.data.confidence,
          method: 'line'
        };
      }
    }

    // Aucun RIB trouvé
    return {
      success: false,
      error: 'Aucun RIB valide (20 chiffres) trouvé dans l\'image. Assurez-vous que l\'image est nette et bien éclairée.',
      extractedText: extractedText.substring(0, 200) // Pour debug
    };

  } catch (error) {
    console.error('Erreur extraction RIB:', error);
    return {
      success: false,
      error: 'Erreur lors de l\'extraction. Veuillez réessayer avec une image plus claire.'
    };
  }
}

/**
 * Prétraite l'image pour améliorer l'OCR
 * @param {File} imageFile 
 * @returns {Promise<string>} Base64 de l'image prétraitée
 */
async function preprocessImage(imageFile) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Redimensionner si l'image est trop grande
        let width = img.width;
        let height = img.height;
        const maxDimension = 2000;
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dessiner l'image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Augmenter le contraste
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          // Convertir en niveaux de gris
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          // Augmenter le contraste
          const contrast = 1.5;
          const adjusted = ((gray - 128) * contrast) + 128;
          const clamped = Math.max(0, Math.min(255, adjusted));
          
          data[i] = data[i + 1] = data[i + 2] = clamped;
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Valide un numéro RIB tunisien
 * @param {string} rib - Numéro RIB à valider
 * @returns {boolean}
 */
export function validateRIB(rib) {
  // RIB tunisien : exactement 20 chiffres
  const ribRegex = /^\d{20}$/;
  return ribRegex.test(rib);
}

/**
 * Formate un RIB pour l'affichage (avec espaces)
 * @param {string} rib - RIB à formater
 * @returns {string} RIB formaté
 */
export function formatRIB(rib) {
  if (!rib) return '';
  // Enlever tous les espaces d'abord
  const cleaned = rib.replace(/\s/g, '');
  if (cleaned.length !== 20) return rib;
  
  // Format tunisien standard: XX XXX XXXXX XXXXXXXXXXX
  // (2 chiffres - 3 chiffres - 5 chiffres - 11 chiffres)
  return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 10)} ${cleaned.slice(10)}`;
}

/**
 * Nettoie un RIB (enlève espaces et tirets)
 * @param {string} rib 
 * @returns {string}
 */
export function cleanRIB(rib) {
  return rib.replace(/[\s\-]/g, '');
}