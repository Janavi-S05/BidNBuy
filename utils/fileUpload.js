const multer= require("multer");
const path= require("path");

//Storage config
const storage= multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"uploads"); //destination folder for storing uploaded files
    },
    filename: function(req,file,cb){
        cb(null,new Date().toISOString().replace(/:/g,"-")+"-"+file.originalname); //upload filename
    },
});

// File filter to accept only images
const fileFilter = (req,file,cb)=>{
    console.log("File sreceived:", file);
    if(file.mimetype.startsWith("image/")){
        cb(null,true);
    }else{
        cb(new Error(`Invalid file type: ${file.mimetype}`),false);
    }
};

const upload = multer({storage,fileFilter});
module.exports= {upload};