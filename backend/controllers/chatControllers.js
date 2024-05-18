const asyncHandler = require("express-async-handler");
const Chat=require("../models/chatModel");
const { verify } = require("jsonwebtoken");
const User = require("../models/userModel");
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    // $and: [
    //   { users: { $elemMatch: { $eq: req.user._id } } },
    //   { users: { $elemMatch: { $eq: userId } } },
    // ],
    users: { $all: [req.user._id, userId] },
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      console.log("Error in Access Chat in Chat Controller", error.message);
      res.status(400);
      throw new Error(error.message);
    }
  }
});
const fetchChats=asyncHandler(async(req,res)=>{
    try{
       Chat.find({users:{$elemMatch:{$eq:req.user._id}}})
       .populate("users","-password")
       .populate("groupAdmin","-password")
       .populate("latestMessage")
        .sort({updatedAt:-1})
        .then(async(results)=>{
           results =await User.populate(results,{
                 path:"latestMessgae.sender",
                 select:"name pic email",
           });
           res.status(200).send(results);
        });
    }catch(error){
      res.status(400);
      throw new Error(error.message);
    }
});
const createGroupChat=asyncHandler(async(req,res)=>{
    if(!req.body.users|| !req.body.name){
        return res.status(400).send({message:"Please fill all the fields"});
    }
    var users=JSON.parse(req.body.users);
    if(users.length<2){
       return res.status(400)
       .send("More than 2 users are required to form a group chat");
    }
    users.push(req.user);
    try{
      const groupChat=await Chat.create(
        {
          chatName:req.bosy.name,
          users:users,
          isGroupChat:true,
          groupAdmin:req.user,
        }
      );
      const fullGroupChat=await Chat.findOne({_id:groupChat._id})
      .populate("users","-password")
      .populate("groupAdmin","-password");
      res.status(200).json(fullGroupChat);
    }catch(error){
        res.status(400);
        throw new Error(error.message);
    }
});
const renameGroup=asyncHandler(async(req,res)=>{
    const {chatId,chatName} =req.body;
    const updatedChat=await Chat.findByIdAndUpdate(
      chatId,{
           chatName,
      },{
        new:true,
      }
    )
    .populate("users","-password")
    .populate("groupAdmin","-password");
    if(!updatedChat){
      res.status(404);
      throw new Error("Chat Not Found");
    }
    else{
      res.json(updatedChat);
    }
    });
    const addToGroup=asyncHandler(async(req,res)=>{
      const {chatId,userId}=req.body;
      // check if the requester is admin
      const loggedUser=req.user._id;
      const UserAdded=await Chat.findOne({_id:{$eq:chatId}});
      if(!UserAdded){
        res.status(404);
        throw new Error("This chat doesn't exist" )
      }
      const admin=UserAdded.groupAdmin;
       if(admin.toString()!== loggedUser.toString()){
        res.status(401);
        throw new Error("You are not the Group Admin");
       }
       // Add
       const added=await Chat.findByIdAndUpdate(
        chatId,{
          $push:{users:userId},

        },
        {
          new:true,
        }
       )
       .populate("users","-password")
       .populate("groupAdmin","-password");
       if(!added){
        res.status(404);
        throw new Error("Chat Not found");
       }
       else
       {
        res.json(added);

       }
    });
    const removeFromGroup= asyncHandler(async(req,res)=>{
        const {chatId,userId}=req.body;
       // check if chat exist 
       const chatExist=await Chat.findByIdAndUpdate(chatId);
          if(!chatExist)
            {
              res.status(404);
              throw new Error("Chat Not Exist");
            }
            // check if the remover is user itself or the admin 
          const checkUser= userId.toString();
          if(checkUser===req.user._id.toString() || groupChat.groupAdmin.toString()===req.user._id.toString())
            {
                  const updatedChats=await Chat.findByIdAndUpdate(
                    chatId,{
                      $pull:{users:checkUser},
                    },
                    {
                      new:true,
                    }
                  )
                  .populate("users","-password")
                  .populate("groupAdmin","-password");
                  return res.json(updatedChats);
            }
            res.status(401);
            throw new Error("You are not an admin");
    });

module.exports={accessChat,fetchChats,createGroupChat,renameGroup,addToGroup,removeFromGroup};