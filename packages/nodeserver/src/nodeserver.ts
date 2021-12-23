let Koa = require('koa');
let Router = require('koa-router');
let bodyparser = require('koa-bodyparser');
let jwt = require('jwt-simple');
let router = new Router()
let app = new Koa();
app.use(bodyparser());
// 可以自己自定义
let secret = 'zhenglei';
// 验证是否登陆
router.post('/login',async(ctx)=>{ 
    let {username,password} = ctx.request.body;
    if(username === 'admin' && password === 'admin'){
       // 通常会查数据库，这里简单的演示
       let token =  jwt.encode(username, secret);
       ctx.body = {
            code:200,
            username,
            token,
       }
    }
});
// 验证是否有权限
router.get('/validate',async(ctx)=>{ 
    let Authorization = ctx.get('authorization')
    let [,token] = Authorization.split(' ');
    if(token){
        try{
            let r = jwt.decode(token,secret);
            ctx.body = {
                code:200,
                username:r,
                token
            }
        }catch(e){
            ctx.body = {
                code:401,
                data:'没有登陆'
            }
        }
    }else{
        ctx.body = {
            code:401,
            data:'没有登陆'
        }
    }
  
});
app.use(router.routes());
app.listen(4000);