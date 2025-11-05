import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const createUser = async (req, res) => {
  try {
    const { name, lastname, cin, email, password, role, banque, rib } = req.body;

    if (!name || !lastname || !cin || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newUser = new User({ name, lastname, cin, email, password, role, banque, rib });
    await newUser.save();

    res.status(201).json({ message: " User created", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: " Error creating user", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email or password invalid" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Email or password invalid" });
    }

    if ((user.role === "formateur" || user.role === "coordinateur") && user.status !== "approuvé") {
      return res.status(403).json({ message: "Compte en attente de validation", status: user.status });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user._id,
        name: user.name,
        lastname: user.lastname,
        cin:user.cin,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message  });

  }
};
//delete user
export const DeleteUser = async (req, res) => {
  try {
    const { id } = req.params; 
    const result = await User.deleteOne({ _id: id });

    if (result.deletedCount > 0) {
      return res.status(200).json({
        message: "User deleted successfully",
      });
    } else {
      return res.status(404).json({
        message: "User not found",
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message  });

}};
//Update User
export const UpdateUser=async(req,res)=>{
  try {
    const {id}=req.params;
    const UpdatedData=req.body;

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent update if status is "en-attente"
    if (existingUser.status === "en-attente") {
      return res.status(400).json({
        message: "Can't update pending users",
      });
    }

    const user=await User.findByIdAndUpdate(id,UpdatedData, {
      new: true, 
      runValidators: true, 
    })

    res.status(200).json(
      {
        message:"User Updated successfully",
        user,
      }
    )
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message  });

    
  }

}
//get user by id
export const getUser=async(req,res)=>{
  try {
    const {id}=req.params;
    const user=await User.findById(id);
    if(!user){
      res.status(404).json({
        message:"User Not Found"
      })
    }
    res.status(200).json({
      user,
    })

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message  });

    
  }
}
