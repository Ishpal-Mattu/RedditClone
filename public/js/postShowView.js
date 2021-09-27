//const { load } = require("dotenv/types");

//const BASE_URL = 'http://localhost:8000/';
url = BASE_URL + "user/current";

// options = {
//     headers: {
//         // This is how the server will know to initialize a JsonResponse object and not an HtmlResponse.
//         Accept: "application/json"
//     }
// };

let theUser;
const setUser = (data) => {
    // If the request was successful, then `data` will have everything you asked for.
    theUser = data.payload[0].id;
    console.log(theUser)
}

const postBookmarkButton = document.getElementById('post-bookmark-button');
const commentBookmarkButton = document.getElementsByClassName('comment-bookmark-button');

let postId = postBookmarkButton.getAttribute('post-id');

for(let i = 0; i<commentBookmarkButton.length; i++)
{
    commentBookmarkButton[i].addEventListener('click', changeCommentBookmark )
}
postBookmarkButton.addEventListener('click', changePostBookmark)

const postDownvoteButton = document.getElementsByClassName('post-downvote-button')[0];
postDownvoteButton.addEventListener('click', () => {
    let postId = postVotesButton.getAttribute('post-id');
    let url = BASE_URL + `post/${postId}`;

    fetch(url, options)
    .then(response => response.json())
    .then((data) => {
        const payload = data.payload;
        
        
        const parentNode = postVotesButton.parentNode;
        
        url = BASE_URL + `post/${postId}/downvote`;
        if(payload.isUpVoted)
        {
            url = BASE_URL + `post/${postId}/unvote`;
        }
        fetch(url, options)
        .then(response => response.json())
        .then((data) => {
            if(data.statusCode !== 200)
                throw "error";
            
            const numVotes = data.payload.totalVotes;
            const postVotes = parentNode.querySelector('.post-votes')
            

            postVotes.innerText = numVotes;
        })
        .catch(() => {
            url = BASE_URL + `post/${postId}/unvote`;
            fetch(url, options)
            .then(response => response.json())
            .then((data) => {
                const numVotes = data.payload.totalVotes;
                const postVotes = parentNode.querySelector('.post-votes')
                
    
                postVotes.innerText = numVotes;
            })
        })
        
        

        
        // fetch(url, options)
        // .then(response => response.json())
        // .then((data) => {
        //     if(data.statusCode !== 200)
        //         throw "error";
            
        //     const numVotes = data.payload.totalVotes;
        //     const postVotes = parentNode.querySelector('.post-votes')
           
    
        //     postVotes.innerText = numVotes;
            
        // })
        // .catch(() => {
        //     url = BASE_URL + `post/${postId}/unvote`;
        //     fetch(url, options)
        //     .then(response => response.json())
        //     .then((data) => {
        //         const numVotes = data.payload.totalVotes;
        //         const postVotes = parentNode.querySelector('.post-votes')
                
    
        //         postVotes.innerText = numVotes;
        //     })
        // })
    })


    
})

const postVotesButton = document.getElementsByClassName('post-upvote-button')[0];
postVotesButton.addEventListener('click', () => {
    
    
    let postId = postVotesButton.getAttribute('post-id');
    let url = BASE_URL + `post/${postId}`;

    fetch(url, options)
    .then(response => response.json())
    .then((data) => {
        const payload = data.payload;
        
        const parentNode = postVotesButton.parentNode;
    
        if(payload.isDownVoted)
        {
            url = BASE_URL + `post/${postId}/unvote`;
            fetch(url, options)
            .then(response => response.json())
            .then((data) => {
                const numVotes = data.payload.totalVotes;
                const postVotes = parentNode.querySelector('.post-votes')
                
    
                postVotes.innerText = numVotes;
            })
        }

        url = BASE_URL + `post/${postId}/upvote`;

        fetch(url, options)
        .then(response => response.json())
        .then((data) => {
            if(data.statusCode !== 200)
                throw "error";

            const numVotes = data.payload.totalVotes;
            const postVotes = parentNode.querySelector('.post-votes')
            
    
            postVotes.innerText = numVotes;
            
        })
        .catch(() => {
            url = BASE_URL + `post/${postId}/unvote`;
            fetch(url, options)
            .then(response => response.json())
            .then((data) => {
                const numVotes = data.payload.totalVotes;
                const postVotes = parentNode.querySelector('.post-votes')
                
    
                postVotes.innerText = numVotes;
            })
        })
    })

    
})


const commentDownVoteButton = document.getElementsByClassName('comment-downvote-button');
for(let i = 0; i<commentDownVoteButton.length; i++)
{
    commentDownVoteButton[i].addEventListener('click', downVoteComment);
}

function downVoteComment(event)
{
    let commmentId = event.target.getAttribute('comment-id');
    //const postId = postVotesButton.getAttribute('post-id');
    let url = BASE_URL + `comment/${commmentId}`;

    fetch(url, options)
    .then(response => response.json())
    .then((data) => {
        const payload = data.payload;
        
        const parentNode = event.target.parentNode;
    
        if(payload.isUpVoted)
        {
            url = BASE_URL + `comment/${commmentId}/unvote`;
            fetch(url, options)
            .then(response => response.json())
            .then((data) => {
                const commentVotes = parentNode.querySelector('.comment-votes')
                let votesInt = parseInt(commentVotes.innerText);
                votesInt--;
    
                commentVotes.innerText = votesInt;
            })
        }

        url = BASE_URL + `comment/${commmentId}/downvote`;

        fetch(url, options)
        .then(response => response.json())
        .then((data) => {
            if(data.statusCode !== 200)
                throw "error";
            const commentVotes = parentNode.querySelector('.comment-votes')
            let votesInt = parseInt(commentVotes.innerText);
            votesInt --;
    
            commentVotes.innerText = votesInt;
            
        })
        .catch(() => {
            url = BASE_URL + `comment/${commmentId}/unvote`;
            fetch(url, options)
            .then(response => response.json())
            .then(() => {
                const commentVotes = parentNode.querySelector('.comment-votes')
                let votesInt = parseInt(commentVotes.innerText);
                votesInt++;
    
                commentVotes.innerText = votesInt;
            })
        })
    })
}



const commentUpVoteButton = document.getElementsByClassName('comment-upvote-button');
for(let i = 0; i< commentUpVoteButton.length; i++)
{
    commentUpVoteButton[i].addEventListener('click', upVoteComment);
}

function upVoteComment(event)
{
    let commmentId = event.target.getAttribute('comment-id');
    const postId = postVotesButton.getAttribute('post-id');
    let url = BASE_URL + `comment/${commmentId}`;

    fetch(url, options)
    .then(response => response.json())
    .then((data) => {
        const payload = data.payload;
        
        const parentNode = event.target.parentNode;
    
        if(payload.isDownVoted)
        {
            url = BASE_URL + `comment/${commmentId}/unvote`;
            fetch(url, options)
            .then(response => response.json())
            .then((data) => {
                const commentVotes = parentNode.querySelector('.comment-votes')
                let votesInt = parseInt(commentVotes.innerText);
                votesInt++;
    
                commentVotes.innerText = votesInt;
            })
        }

        url = BASE_URL + `comment/${commmentId}/upvote`;

        fetch(url, options)
        .then(response => response.json())
        .then((data) => {
            if(data.statusCode !== 200)
                throw "error";
            const commentVotes = parentNode.querySelector('.comment-votes')
            let votesInt = parseInt(commentVotes.innerText);
            votesInt ++;
    
            commentVotes.innerText = votesInt;
            
        })
        .catch(() => {
            url = BASE_URL + `comment/${commmentId}/unvote`;
            fetch(url, options)
            .then(response => response.json())
            .then(() => {
                const commentVotes = parentNode.querySelector('.comment-votes')
                let votesInt = parseInt(commentVotes.innerText);
                votesInt--;
    
                commentVotes.innerText = votesInt;
            })
        })
    })
}






function changeCommentBookmark(event)
{
    const theParent = event.target.parentNode;
    const commentId = theParent.getAttribute('comment-id');

    if(event.target.innerText.includes("Unbookmark"))
    {
        url = BASE_URL + `comment/${commentId}/unbookmark`
        fetch(url, options)
            .then(response => response.json())
            .then((data) => {
                event.target.innerText = "Bookmark Comment";
            })
    }
    else
    {
        url = BASE_URL + `comment/${commentId}/bookmark`
        fetch(url, options)
            .then(response => response.json())
            .then((data) => {
                event.target.innerText = "Unbookmark Comment";
            })
    }
}



function changePostBookmark(){
    // fetch(url, options)
    // .then(response => response.json())
    // .then(data => {
    //     setUser(data)
    // })
    // .then(() => {
        if(postBookmarkButton.innerText.includes("Unbookmark"))
        {
            url = BASE_URL + `post/${postId}/unbookmark`;
            fetch(url, options)
                .then(response => response.json())
                .then((data)=> {
                    postBookmarkButton.innerHTML = "Bookmark Post";
                })

            

        }
        else
        {
            url = BASE_URL + `post/${postId}/bookmark`;
            fetch(url, options)
                .then(response => response.json())
                .then((data) => {
                    postBookmarkButton.innerHTML = "Unbookmark Post";
                })
            
        }
    
    // .catch(function(error){
    //     console.error(error);
    // }



    //postId = postId.TEXT_NODE
    
}


