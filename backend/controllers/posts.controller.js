import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import Post from "../models/posts.model.js";
import Comment from "../models/comments.model.js";
import bcrypt from "bcrypt";


export const activeCheck = async (req, res) => {
  return res.status(200).json({
    message: "Running",
  });
};


export const createPost = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const post = new Post({
      userId: user._id,
      body: req.body.body,
      likes: 0,
      media: req.file ? req.file.filename : "",
      fileType: req.file
        ? req.file.mimetype.split("/")[1]
        : "",
    });

    await post.save();

    return res.status(200).json({
      message: "Post Created",
    });

  } catch (error) {
    console.error("CREATE POST ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};


export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate(
        "userId",
        "name username email profilePicture"
      );

    return res.status(200).json({
      posts,
    });

  } catch (error) {
    console.error("GET POSTS ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};



export const deletePost = async (req, res) => {

  const { token, post_id } = req.body;

  console.log("================================");
  console.log("DELETE POST REQUEST");
  console.log("POST ID:", post_id);
  console.log("TOKEN EXISTS:", !!token);
  console.log("================================");

  try {


    if (!token) {
      return res.status(401).json({
        message: "Token is missing",
      });
    }



    const user = await User.findOne({
      token: token,
    }).select("_id");

    console.log("LOGGED USER:", user);


    if (!user) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }



    const post = await Post.findById(post_id);

    console.log("POST:", post);


    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }



    const postOwnerId = post.userId
      ? post.userId.toString()
      : null;

    const loggedUserId = user._id.toString();


    console.log("POST OWNER ID:", postOwnerId);
    console.log("LOGGED USER ID:", loggedUserId);



    if (postOwnerId !== loggedUserId) {

      console.log(
        "USER DOES NOT OWN THIS POST"
      );

      return res.status(403).json({
        message:
          "You can only delete your own posts",
        postOwnerId: postOwnerId,
        loggedUserId: loggedUserId,
      });
    }



    await Post.findByIdAndDelete(post_id);


    console.log(
      "POST DELETED SUCCESSFULLY"
    );


    return res.status(200).json({
      message: "Post Deleted",
    });


  } catch (error) {

    console.error(
      "DELETE POST ERROR:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};




export const commentPost = async (req, res) => {

  const {
    token,
    post_id,
    commentBody,
  } = req.body;

  try {

    const user = await User.findOne({
      token: token,
    }).select("_id");


    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }


    const post = await Post.findById(post_id);


    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }


   const comment = new Comment({
  userId: user._id,
  postId: post_id,
  body: commentBody.trim(),
});

    await comment.save();


    return res.status(200).json({
      message: "Comment Added",
    });

  } catch (error) {

    console.error(
      "COMMENT ERROR:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};



export const getCommentsByPost = async (req, res) => {
  const { post_id } = req.query;

  try {
    const comments = await Comment.find({
      postId: post_id,
    })
      .populate(
        "userId",
        "name username profilePicture"
      )
      .sort({
        _id: -1,
      });

    return res.status(200).json({
      comments: comments,
    });

  } catch (error) {
    console.error(
      "GET COMMENTS ERROR:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};


export const deleteCommentOfUser = async (
  req,
  res
) => {

  const {
    token,
    comment_id,
  } = req.body;

  try {

    const user = await User.findOne({
      token: token,
    }).select("_id");


    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }


    const comment = await Comment.findById(
      comment_id
    );


    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }


    if (
      comment.userId.toString() !==
      user._id.toString()
    ) {

      return res.status(401).json({
        message: "Unauthorized",
      });

    }


    await Comment.deleteOne({
      _id: comment_id,
    });


    return res.status(200).json({
      message: "Comment Deleted",
    });

  } catch (error) {

    console.error(
      "DELETE COMMENT ERROR:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};



export const incrementLikes = async (
  req,
  res
) => {

  const { post_id } = req.body;

  try {

    const post = await Post.findById(post_id);


    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }


    post.likes = post.likes + 1;

    await post.save();


    return res.status(200).json({
      message: "Likes Incremented",
    });

  } catch (error) {

    console.error(
      "LIKE ERROR:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};