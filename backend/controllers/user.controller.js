import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import ConnectionRequestModel from "../models/connections.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";



const convertUserDataToPDF = async (userData) => {
  return new Promise((resolve, reject) => {
    try {
      if (!userData || !userData.userId) {
        return reject(new Error("User data not found"));
      }

      const uploadsDirectory = path.join(process.cwd(), "uploads");

      if (!fs.existsSync(uploadsDirectory)) {
        fs.mkdirSync(uploadsDirectory, {
          recursive: true,
        });
      }

      const fileName = `resume_${userData.userId._id}.pdf`;

      const outputPath = path.join(
        uploadsDirectory,
        fileName
      );

      const doc = new PDFDocument();

      const stream = fs.createWriteStream(outputPath);

      stream.on("finish", () => {
        resolve(`uploads/${fileName}`);
      });

      stream.on("error", (error) => {
        reject(error);
      });

      doc.on("error", (error) => {
        reject(error);
      });

      doc.pipe(stream);


    

      if (userData.userId?.profilePicture) {
        try {
          const profilePicture = path.basename(
            userData.userId.profilePicture
          );

          const imagePath = path.join(
            uploadsDirectory,
            profilePicture
          );

          console.log("PROFILE IMAGE PATH:", imagePath);

          if (fs.existsSync(imagePath)) {
            try {
              doc.image(imagePath, {
                fit: [100, 100],
                align: "center",
                valign: "center",
              });

              doc.moveDown();
            } catch (imageError) {
              console.log(
                "PROFILE IMAGE ERROR:",
                imageError.message
              );

              doc.moveDown();
            }
          } else {
            console.log(
              "PROFILE IMAGE NOT FOUND:",
              imagePath
            );
          }
        } catch (imageError) {
          console.log(
            "PROFILE IMAGE PROCESSING ERROR:",
            imageError.message
          );
        }
      }


    

      doc
        .fontSize(24)
        .text(
          userData.userId.name || "User",
          {
            align: "center",
          }
        );

      doc.moveDown();

      doc
        .fontSize(14)
        .text(
          `Username: ${
            userData.userId.username || ""
          }`,
          {
            align: "center",
          }
        );

      doc
        .fontSize(14)
        .text(
          `Email: ${
            userData.userId.email || ""
          }`,
          {
            align: "center",
          }
        );

      doc.moveDown();

      doc
        .fontSize(18)
        .text("Bio");

      doc.moveDown(0.5);

      doc
        .fontSize(12)
        .text(
          userData.bio ||
            "No bio available"
        );


      
      if (
        userData.currentPost ||
        userData.currentCompany
      ) {
        doc.moveDown();

        doc
          .fontSize(18)
          .text("Current Work");

        doc.moveDown(0.5);

        if (userData.currentPost) {
          doc
            .fontSize(12)
            .text(
              `Position: ${userData.currentPost}`
            );
        }

        if (userData.currentCompany) {
          doc
            .fontSize(12)
            .text(
              `Company: ${userData.currentCompany}`
            );
        }
      }


    
      doc.moveDown();

      doc
        .fontSize(18)
        .text("Work History");

      doc.moveDown(0.5);


      const pastWork = userData.pastWork || [];

      if (pastWork.length === 0) {
        doc
          .fontSize(12)
          .text("No work history available");
      } else {
        pastWork.forEach((work, index) => {
          doc
            .fontSize(14)
            .text(
              `${index + 1}. ${
                work.company || "Company"
              }`
            );

          if (work.position) {
            doc
              .fontSize(12)
              .text(
                `Position: ${work.position}`
              );
          }

          if (work.years) {
            doc
              .fontSize(12)
              .text(
                `Years: ${work.years}`
              );
          }

          if (work.description) {
            doc
              .fontSize(12)
              .text(
                `Description: ${work.description}`
              );
          }

          doc.moveDown();
        });
      }


      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};


export const register = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      password,
    } = req.body;

    if (
      !name ||
      !username ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { username },
        { email },
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          "Username or email already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    const profile = new Profile({
      userId: user._id,
    });

    await profile.save();

    return res.status(201).json({
      message: "User registered successfully",
    });

  } catch (error) {
    console.log(
      "REGISTER ERROR:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};


export const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.token = token;

    await user.save();

    return res.status(200).json({
      token,
      user,
    });

  } catch (error) {
    console.log(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};



export const uploadProfilePicture = async (req, res) => {
  try {
    const token = req.body.token || req.query.token;

    console.log("UPLOAD TOKEN:", token);

    if (!token) {
      return res.status(401).json({
        message: "Token is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No profile picture uploaded",
      });
    }

    const user = await User.findOne({
      token: token,
    });

    console.log("UPLOAD USER:", user);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.profilePicture = req.file.filename;

    await user.save();

    return res.status(200).json({
      message: "Profile picture uploaded successfully",
      profilePicture: user.profilePicture,
    });

  } catch (error) {
    console.log("UPLOAD PROFILE PICTURE ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};


export const updateUserProfile = async (req, res) => {
  try {
    const { token, name, username, email } = req.body;

    if (!token) {
      return res.status(401).json({
        message: "Token is required",
      });
    }

    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (name) {
      user.name = name;
    }

    if (username) {
      user.username = username;
    }

    if (email) {
      user.email = email;
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.log("UPDATE USER PROFILE ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getUserAndProfile = async (req, res) => {
  try {
    const token = req.query.token;

    if (!token) {
      return res.status(401).json({
        message: "Token is required",
      });
    }

    const user = await User.findOne({
      token: token,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const userProfile = await Profile.findOne({
      userId: user._id,
    }).populate(
      "userId",
      "name username email profilePicture"
    );

    if (!userProfile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    return res.status(200).json(userProfile);

  } catch (error) {
    console.log(
      "GET USER AND PROFILE ERROR:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};



export const updateProfileData = async (
  req,
  res
) => {
  try {
    const user_id = req.user;

    const {
      bio,
      currentPost,
      currentCompany,
      pastWork,
    } = req.body;

    let profile =
      await Profile.findOne({
        userId: user_id,
      });

    if (!profile) {
      profile = new Profile({
        userId: user_id,
      });
    }

    if (bio !== undefined) {
      profile.bio = bio;
    }

    if (
      currentPost !== undefined
    ) {
      profile.currentPost =
        currentPost;
    }

    if (
      currentCompany !== undefined
    ) {
      profile.currentCompany =
        currentCompany;
    }

    if (
      pastWork !== undefined
    ) {
      profile.pastWork =
        pastWork;
    }

    await profile.save();

    return res.status(200).json({
      message:
        "Profile data updated successfully",
      profile,
    });

  } catch (error) {
    console.log(
      "UPDATE PROFILE DATA ERROR:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};


export const getAllUserProfile = async (
  req,
  res
) => {
  try {
    const profiles =
      await Profile.find()
        .populate(
          "userId",
          "name username email profilePicture"
        );

    return res.status(200).json(
      profiles
    );

  } catch (error) {
    console.log(
      "GET ALL USER PROFILE ERROR:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};


export const ConnectionRequest = async (req, res) => {
  try {
    const token = req.body.token;
    const connectionId = req.body.user_id;

    console.log("===== SEND CONNECTION =====");
    console.log("TOKEN:", token);
    console.log("CONNECTION ID:", connectionId);

    if (!token) {
      return res.status(401).json({
        message: "Token is required",
      });
    }

    if (!connectionId) {
      return res.status(400).json({
        message: "Connection user ID is required",
      });
    }

    const user = await User.findOne({
      token: token,
    });

    console.log("SENDER:", user?._id);

    if (!user) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const user_id = user._id;

    const existingRequest =
      await ConnectionRequestModel.findOne({
        userId: user_id,
        connectionId: connectionId,
      });

    if (existingRequest) {
      return res.status(400).json({
        message: "Request already sent",
      });
    }

    const request = new ConnectionRequestModel({
      userId: user_id,
      connectionId: connectionId,
      status_accepted: false,
    });

    await request.save();

    console.log("SAVED REQUEST:", request);

    return res.status(200).json({
      message: "Connection request sent",
    });

  } catch (error) {
    console.log("CONNECTION REQUEST ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};


export const getMyConnectionsRequests = async (req, res) => {
  try {
    const token = req.query.token;

    console.log("TOKEN:", token);

    if (!token) {
      return res.status(401).json({
        message: "Token is required",
      });
    }

    const user = await User.findOne({
      token: token,
    });

    console.log("CURRENT USER:", user);

    if (!user) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    console.log("CURRENT USER ID:", user._id);

    const requests = await ConnectionRequestModel.find({
      connectionId: user._id,
      status_accepted: false,
    }).populate(
      "userId",
      "name username email profilePicture"
    );

    console.log("FOUND REQUESTS:", requests);

    return res.status(200).json({
      connection: requests,
    });
  } catch (error) {
    console.log("GET CONNECTION REQUESTS ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};



export const whatAreMyConnection = async (req, res) => {
  try {
    const token = req.query.token;

    if (!token) {
      return res.status(401).json({
        message: "Token is required",
      });
    }

    const user = await User.findOne({
      token: token,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const user_id = user._id;

    console.log("MY USER ID:", user_id);

    const connections =
      await ConnectionRequestModel.find({
        $or: [
          {
            userId: user_id,
          },
          {
            connectionId: user_id,
          },
        ],
        status_accepted: true,
      })
        .populate(
          "userId",
          "name username email profilePicture"
        )
        .populate(
          "connectionId",
          "name username email profilePicture"
        );

    return res.status(200).json({
      connections: connections,
    });

  } catch (error) {
    console.log(
      "GET CONNECTIONS ERROR:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};



export const acceptConnectionRequest = async (req, res) => {
  try {
    const token = req.body.token;
    const { requestId } = req.body;

    console.log("===== ACCEPT CONNECTION =====");
    console.log("TOKEN:", token);
    console.log("REQUEST ID:", requestId);

    if (!token) {
      return res.status(401).json({
        message: "Token is required",
      });
    }

    if (!requestId) {
      return res.status(400).json({
        message: "Request ID is required",
      });
    }

    const user = await User.findOne({
      token: token,
    });

    console.log("CURRENT USER ID:", user?._id);

    if (!user) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const request = await ConnectionRequestModel.findOne({
      _id: requestId,
      connectionId: user._id,
      status_accepted: false,
    });

    console.log("FOUND REQUEST:", request);

    if (!request) {
      return res.status(404).json({
        message: "Connection request not found",
      });
    }

    request.status_accepted = true;

    await request.save();

    console.log("REQUEST ACCEPTED:", request);

    return res.status(200).json({
      message: "Connection request accepted",
      request: request,
    });

  } catch (error) {
    console.log("ACCEPT CONNECTION ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};


export const getUserProfileAndUserBasedOnUsername =
  async (req, res) => {
    try {
      const {
        username,
      } = req.query;

      if (!username) {
        return res.status(400).json({
          message:
            "Username is required",
        });
      }

      const user =
        await User.findOne({
          username,
        });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const profile =
        await Profile.findOne({
          userId: user._id,
        }).populate(
          "userId",
          "name username email profilePicture"
        );

      if (!profile) {
        return res.status(404).json({
          message:
            "Profile not found",
        });
      }

      return res.status(200).json(
        profile
      );

    } catch (error) {
      console.log(
        "GET PROFILE BY USERNAME ERROR:",
        error
      );

      return res.status(500).json({
        message: error.message,
      });
    }
  };




export const downloadProfile = async (
  req,
  res
) => {
  try {
    const user_id = req.query.id;

    console.log(
      "DOWNLOAD USER ID:",
      user_id
    );

    if (!user_id) {
      return res.status(400).json({
        message:
          "User ID is required",
      });
    }

    const userProfile =
      await Profile.findOne({
        userId: user_id,
      }).populate(
        "userId",
        "name username email profilePicture"
      );

    console.log(
      "PROFILE FOUND:",
      !!userProfile
    );

    if (!userProfile) {
      return res.status(404).json({
        message:
          "Profile not found",
      });
    }

    const outputPath =
      await convertUserDataToPDF(
        userProfile
      );

    console.log(
      "PDF CREATED:",
      outputPath
    );

    return res.status(200).json({
      message: outputPath,
    });

  } catch (error) {
    console.error(
      "DOWNLOAD RESUME ERROR:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};