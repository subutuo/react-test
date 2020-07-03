const Post = require('./models/post')

exports.createFakeData = () => {
  const posts = Array(40).fill(null).map((_, i) => ({
    title: `포스트 #${i}`,
    body: '테스트 바디',
    tags: ['가짜', 'dummy']
  }))
  
  Post.insertMany(posts, (err, docs) => {
    console.log(docs)
  })

}
