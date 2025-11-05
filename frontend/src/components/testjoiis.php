<?php
require_once 'config.php';
require_once 'auth.php';
requireLogin();
$user = currentUser($pdo);

$room_id = intval($_GET['room_id'] ?? 0);
$stmt = $pdo->prepare("SELECT * FROM rooms WHERE id = ?");
$stmt->execute([$room_id]);
$room = $stmt->fetch();
if (!$room) {
    die("Chambre introuvable.");
}

$errors = [];
$success = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $start = $_POST['start_date'] ?? '';
    $end = $_POST['end_date'] ?? '';

    if (!$start || !$end) {
        $errors[] = "Veuillez choisir des dates valides.";
    } elseif ($start > $end) {
        $errors[] = "La date de début doit être antérieure ou égale à la date de fin.";
    } else {
        // vérifier disponibilité : pas de chevauchement
        $stmt = $pdo->prepare("
            SELECT COUNT(*) FROM bookings 
            WHERE room_id = ? 
              AND NOT (end_date < ? OR start_date > ?)
        ");
        $stmt->execute([$room_id, $start, $end]);
        $count = $stmt->fetchColumn();
        if ($count > 0) {
            $errors[] = "La chambre n'est pas disponible sur ces dates.";
        } else {
            // calculer prix total (nombre de nuits * prix)
            $d1 = new DateTime($start);
            $d2 = new DateTime($end);
            $interval = $d1->diff($d2);
            $nights = max(1, $interval->days); // si même jour, on considère 1 nuit
            $total = $nights * $room['price'];
            $ins = $pdo->prepare("INSERT INTO bookings (user_id, room_id, start_date, end_date, total_price) VALUES (?, ?, ?, ?, ?)");
            $ins->execute([$user['id'], $room_id, $start, $end, $total]);
            $success = "Réservation enregistrée ! Total : " . number_format($total,2) . " € pour $nights nuit(s).";
        }
    }
}