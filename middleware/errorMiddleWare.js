const errorHandler = (err,req,res,next)=>{
    const statusCode = res.statusCode? res.statusCode:500;
    res.status(statusCode);

    res.json({
        message: err.nessage,
        stack: process.env.NODE_env === "development"? err.stack:null,
    })
}

module.exports = errorHandler;