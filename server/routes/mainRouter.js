const express = require('express');
const mainrouter = express.Router();
const BlogPost= require('../models/blogpost');

// mainrouter.get('/blog', async (req, res)=>{
//     try {
        
//         let blogspage= 2;
//         let page = req.query.page || 1;
        
//         const data= await BlogPost.aggregate([{ $sort : { createdAt: -1 } }])
//         .skip(blogspage * page - blogspage)
//         .limit(blogspage)
//         .exec();
        
//         const count= await BlogPost.countDocuments();
//         const nextPage= parseInt(page) + 1;
//         const hasNextpage= nextPage <= Math.ceil(count / blogspage);
        
//         res.render('Blog',
//              {title: 'Blogs',
//                 data,
//                 current : page,
//             nextPage : hasNextpage ? nextPage : null
//     });

//     } catch (error) {
//         console.log(error);
//     }
    
// })

mainrouter.get('/blog', async (req, res) => {
    try {
        let blogspage = 2;
        let page = parseInt(req.query.page) || 1;

        const data = await BlogPost.aggregate([{ $sort: { createdAt: -1 } }])
            .skip(blogspage * (page - 1))
            .limit(blogspage);

        const count = await BlogPost.countDocuments();
        const hasNextPage = page < Math.ceil(count / blogspage);
        const nextPage = hasNextPage ? page + 1 : null;
        const prevPage = page > 1 ? page - 1 : null;
        res.render('Blog', {
            title: 'Blogs',
            data,
            current: page,
            nextPage,
            prevPage
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// mainrouter.get('/blogPosts/:id', async (req, res) => {
//     try {
//         let slug = req.params.id;

//         const postdata = await BlogPost.findById(slug);

//         if (!postdata) {
//             return res.status(404).send("Post not found");
//         }

//         res.render('blogPosts', { title: postdata.title, postdata });

//     } catch (err) {
//         console.error(err);
//         res.status(500).send("Internal Server Error");
//     }
// });

mainrouter.get('/blogPosts/:id', async (req, res) => {
    try {
        let slug = req.params.id;
        const postdata = await BlogPost.findById(slug);

        if (!postdata) {
            return res.status(404).send("Post not found");
        }

        res.render('blogPosts', { title: postdata.title, postdata }); // ✅ Correct template

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});




module.exports = mainrouter;