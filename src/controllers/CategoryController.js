const Controller = require('./Controller');
const Category = require('../models/Category');
const User = require('../models/User');
const { timeStamp } = require('console');
const CategoryException = require('../exceptions/CategoryException');
const Post = require('../models/Post');
const HttpStatusCode = require('../helpers/HttpStatusCode');

class CategoryController extends Controller {

    constructor(request, response, session){
        super(request, response, session);

        const requestMethod = this.request.getRequestMethod();
        this.headerLinks = [{link: "http://localhost:8000", name: "Home"}, {link: "http://localhost:8000/user/new", name: "Create User"}];

        this.response.setResponse({message: "Invalid request method!", statusCode: 405, payload: {} });
        this.action = this.error;

        if(requestMethod.toUpperCase() == "DELETE"){

            this.action = this.destroy;
        }
        else if (requestMethod.toUpperCase() == "GET"){
            if(request.getParameters().header[0] == "new"){
                this.action = this.getNewForm;
            }
            else if (request.getParameters().header.length == 1)
            {
                this.action = this.show;
            }
            else if(request.getParameters().header.length >= 2)
            {
                this.action = this.getEditForm;
            }
            else
            {
                this.action = this.list
            }
            
        }
        else if (requestMethod.toUpperCase() == 'PUT'){
            this.action = this.edit;
            
        }
        else if (requestMethod.toUpperCase() == "POST"){
            this.action = this.new;
        }
    }


    async getNewForm(){

    }

    async new(){
        const param = this.request.getParameters();
        const userId = this.session.get('user_id');
        if(!userId)
            throw new CategoryException("Cannot create Category: You must be logged in.", HttpStatusCode.UNAUTHORIZED);
        
        const createdCategory = await Category.create(userId, param.body.title, param.body.description);

        

        await this.response.setResponse({message: "Category created successfully!", payload: createdCategory, redirect: "", isLoggedIn: this.session.exists('user_id')});
        
        
        return this.response;

    }

    async list(){
        let foundCategory = await Category.findAll();
        await this.response.setResponse({message: "Categories retrieved successfully!", statusCode: 200, payload: foundCategory, isLoggedIn: this.session.exists('user_id')});
        return this.response;
    }

    async show(){
        const param = this.request.getParameters();
        const foundCategory = await Category.findById(param.header[0]);
        if(foundCategory == null)
        {
            throw new CategoryException(`Cannot retrieve Category: Category does not exist with ID ${param.header[0]}.`)
        }

        const isCatDeleted = foundCategory.deletedAt != null;
        const userId = this.session.get('user_id');

        const categoryPosts = await Post.findByCategory(param.header[0]);
        for(let i = 0; i < categoryPosts.length; i++)
        {
            categoryPosts[i].isDeleted = categoryPosts[i].deletedAt != null;
            categoryPosts[i].totalVotes = await categoryPosts[i].getTotalVotes();
        }
        
        const theHeader = this.headerLinks;
        theHeader.push({link: `http://localhost:8000/user/${userId}`, name: "My Profile"});

        await this.response.setResponse({message: "Category retrieved successfully!", statusCode: 200, payload: foundCategory, template: "Category/ShowView", title: foundCategory.title, posts: categoryPosts, isLoggedIn: this.session.exists('user_id'), isCatDeleted: isCatDeleted, header: theHeader});
        return this.response;
    }


    async getEditForm(){
        const param = this.request.getParameters();
        const category = await Category.findById(parseInt(param.header[0]));
    
        if(!this.session.exists("user_id"))
            throw new CategoryException("Cannot update Category: You must be logged in.", HttpStatusCode.UNAUTHORIZED);

        if(category == null)
            throw new CategoryException(`Cannot update Category: Category does not exist with ID ${param.header[0]}.`);

        if(category.getUserId() !== this.session.get("user_id"))
            throw new CategoryException("Cannot update Category: You cannot update a category created by someone other than yourself.", HttpStatusCode.FORBIDDEN);

       

        await this.response.setResponse({message: `Edit ${category.getTitle()} category`, statusCode: 200, payload: category, title: "Edit Form", template: "Category/EditView", isLoggedIn: this.session.exists('user_id')});

        return this.response;
    }

    async edit(){
        const param = this.request.getParameters();

        if(!this.session.exists("user_id"))
            throw new CategoryException("Cannot update Category: You must be logged in.", HttpStatusCode.UNAUTHORIZED);

        let categoryToUpdate = await Category.findById(param.header[0]);

        if(categoryToUpdate == null)
            throw new CategoryException(`Cannot update Category: Category does not exist with ID ${param.header[0]}.`);
        

        if(categoryToUpdate.getUserId() !== this.session.get("user_id"))
            throw new CategoryException("Cannot update Category: You cannot update a category created by someone other than yourself.", HttpStatusCode.FORBIDDEN);

        if(categoryToUpdate.getDeletedAt() !== null)
            throw new CategoryException("Cannot update Category: You cannot update a category that has been deleted.", HttpStatusCode.BAD_REQUEST);


        
        
        if(!param.body.user_id && !param.body.title && !param.body.description)
        {
            throw new CategoryException('Cannot update Category: No update parameters were provided.');
        }
        //console.log(pokemonToUpdate);

        
        if(param.body.user_id)
        {
            categoryToUpdate.setUser(await User.findById(para.body.userId))
            categoryToUpdate.setUserId(param.body.userId);
        }
        if(param.body.title)
        {
            categoryToUpdate.setTitle(param.body.title);
        }
        if(param.body.description)
        {
            categoryToUpdate.setDescription(param.body.description);
        }            
        
        
        const success =  await categoryToUpdate.save();
        
        await this.response.setResponse({message: "Category updated successfully!", payload: categoryToUpdate, redirect: `category/${categoryToUpdate.id}`, title: categoryToUpdate.title})

        return this.response;


    }

    async destroy(){
        const param = this.request.getParameters();

        if(!this.session.exists("user_id"))
            throw new CategoryException("Cannot delete Category: You must be logged in.", HttpStatusCode.UNAUTHORIZED);

        const categoryToDelete = await Category.findById(param.header[0]);
        if(categoryToDelete == null)
        {
            throw new CategoryException(`Cannot delete Category: Category does not exist with ID ${param.header[0]}.`)
        }

        if(categoryToDelete.getUserId() !== this.session.get("user_id"))
            throw new CategoryException("Cannot delete Category: You cannot delete a category created by someone other than yourself.", HttpStatusCode.FORBIDDEN);

        if(categoryToDelete.getDeletedAt() !== null)
            throw new CategoryException("Cannot delete Category: You cannot delete a category that has been deleted.", HttpStatusCode.BAD_REQUEST);


        await categoryToDelete.remove();
        await this.response.setResponse({message: "Category deleted successfully!", payload: categoryToDelete, redirect: ""});

        return this.response;
    }


    setAction(action){
        this.action = action;
    }

    getAction(){
        return this.action;
    }

    async doAction(){
        return await this.action();
    }
}

module.exports = CategoryController;
