const Category = require('../models/Category');
const Controller = require('./Controller');

class HomeController extends Controller {
    constructor(request, response, session){
        super(request, response, session);
        this.action = this.home;
    }

    async home(){
        const header = [{link: "http://localhost:8000", name: "Home"}, {link: "http://localhost:8000/user/new", name: "Create User"}];
        
        const categories = await Category.findAll();
        
        for(let i = 0; i < categories.length; i++){
            categories[i].isDeleted = categories[i].deletedAt != null;
        }

        await this.response.setResponse({message: "Homepage!", statusCode: 200, payload: {}, title: "Welcome", template: "HomeView", header: header, heading: "Welcome to Reddit!", categories: categories, isLoggedIn: this.session.exists('user_id') });
        return this.response;
    }

    
    setAction(){
        this.action = this.action;
    }

    getAction(){
        return this.action;
    }

    async doAction(){
        return await this.action();
    }

    error(){
        return this.response;
    }
}

module.exports = HomeController;
