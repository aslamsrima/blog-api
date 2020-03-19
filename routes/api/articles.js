const mongoose = require('mongoose');
const router = require('express').Router();
const Articles = mongoose.model('Articles');
var slugify = require('slugify')

router.post('/', (req, res, next) => {
  const { body } = req;

  if(!body.title) {
    return res.status(422).json({
      errors: {
        title: 'is required',
      },
    });
  }

  if(!body.author) {
    return res.status(422).json({
      errors: {
        author: 'is required',
      },
    });
  }

  if(!body.body) {
    return res.status(422).json({
      errors: {
        body: 'is required',
      },
    });
  }

  let sluggifyText=slugify(body.title, {
    replacement: '-',  // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: true,      // convert to lower case, defaults to `false`
    strict: false,     // strip special characters except replacement, defaults to `false`
  })

  body.titleString=`${new Date().getTime()}-${sluggifyText}`;



  const finalArticle = new Articles(body);
  return finalArticle.save()
    .then(() => res.json({ article: finalArticle.toJSON() }))
    .catch(next);
});

router.get('/', (req, res, next) => {
  return Articles.find()
    .sort({ createdAt: 'descending' })
    .then((articles) => res.json({ articles: articles.map(article => article.toJSON()) }))
    .catch(next);
});

router.param('id', (req, res, next, id) => {
  return Articles.findById(id, (err, article) => {
    if(err) {
      return res.sendStatus(404);
    } else if(article) {
      req.article = article;
      return next();
    }
  }).catch(next);
});



router.get('/:slugText', (req, res, next) => {
  return Articles.findOne({
    titleString:req.params.slugText
  }, (err, article) => {
    if(err) {
      return res.sendStatus(404);
    } else if(article) {
      return res.json({
        article: article.toJSON(),
      });
    }
  }).catch(next);
});

router.get('/single/:id', (req, res, next) => {
  return Articles.findOne({
    _id: req.params.id
  }, (err, article) => {
    if(err) {
      return res.sendStatus(404);
    } else if(article) {
      
      return res.json({
        article: article,
      });
    }
  })
});



router.patch('/:id', (req, res, next) => {
  const { body } = req;

  if(typeof body.title !== 'undefined') {
    req.article.title = body.title;
   let sluggifyText=slugify(body.title, {
    replacement: '-',  // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: true,      // convert to lower case, defaults to `false`
    strict: false,     // strip special characters except replacement, defaults to `false`
  })

    req.article.titleString=`${new Date().getTime()}-${sluggifyText}`
  }

  if(typeof body.author !== 'undefined') {
    req.article.author = body.author;
  }

  if(typeof body.body !== 'undefined') {
    req.article.body = body.body;
  }
  return req.article.save()
    .then(() => res.json({ article: req.article.toJSON() }))
    .catch(next);
});

router.delete('/:id', (req, res, next) => {
  return Articles.findByIdAndRemove(req.article._id)
    .then(() => res.sendStatus(200))
    .catch(next);
});

module.exports = router;