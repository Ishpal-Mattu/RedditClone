const postUpvoteButton = document.getElementsByClassName('post-upvote-button');
for(let i = 0; i<postUpvoteButton.length; i++)
{
    postUpvoteButton[i].addEventListener('click', upVotePost)
}

const postDownvoteButton = document.getElementsByClassName('post-downvote-button');
for(let i = 0; i<postUpvoteButton.length; i++)
{
    postDownvoteButton[i].addEventListener('click', downVotePost)
}


function downVotePost(event){
    let parentNode = event.target.parentNode;
    parentNode = parentNode.parentNode;
    let postId = parentNode.getAttribute('post-id');

    let url = BASE_URL + `post/${postId}`;

    fetch(url, options)
    .then(response => response.json())
    .then((data) => {
        const payload = data.payload;
        
        if(payload.isUpVoted)
        {
            url = BASE_URL + `post/${postId}/unvote`;
            fetch(url, options)
            .then(response => response.json())
            .then((data) => {
                const postVotes = parentNode.querySelector('.post-votes')
                let votesInt = parseInt(postVotes.innerText);
                votesInt--;
    
                postVotes.innerText = votesInt;
            })
        }

        url = BASE_URL + `post/${postId}/downvote`;

        fetch(url, options)
        .then(response => response.json())
        .then((data) => {
            if(data.statusCode !== 200)
                throw "error";
            const postVotes = parentNode.querySelector('.post-votes')
            let votesInt = parseInt(postVotes.innerText);
            votesInt--;
    
            postVotes.innerText = votesInt;
            
        })
        .catch(() => {
            url = BASE_URL + `post/${postId}/unvote`;
            fetch(url, options)
            .then(response => response.json())
            .then(() => {
                const postVotes = parentNode.querySelector('.post-votes')
                let votesInt = parseInt(postVotes.innerText);
                votesInt++;
    
                postVotes.innerText = votesInt;
            })
        })
    })

    
}

function upVotePost(event)
{
    let parentNode = event.target.parentNode;
    parentNode = parentNode.parentNode;
    let postId = parentNode.getAttribute('post-id');

    let url = BASE_URL + `post/${postId}`;

    fetch(url, options)
    .then(response => response.json())
    .then((data) => {
        const payload = data.payload;
        if(payload.isDownVoted)
        {
            url = BASE_URL + `post/${postId}/unvote`;
            fetch(url, options)
            .then(response => response.json())
            .then((data) => {
                const postVotes = parentNode.querySelector('.post-votes')
                let votesInt = parseInt(postVotes.innerText);
                votesInt++;
    
                postVotes.innerText = votesInt;
            })
        }

        url = BASE_URL + `post/${postId}/upvote`;

        fetch(url, options)
        .then(response => response.json())
        .then((data) => {
            if(data.statusCode !== 200)
                throw "error";
            
            const postVotes = parentNode.querySelector('.post-votes')
            let votesInt = parseInt(postVotes.innerText);
            votesInt ++;
    
            postVotes.innerText = votesInt;
            
        })
        .catch(() => {
            url = BASE_URL + `post/${postId}/unvote`;
            fetch(url, options)
            .then(response => response.json())
            .then(() => {
                const postVotes = parentNode.querySelector('.post-votes')
                let votesInt = parseInt(postVotes.innerText);
                votesInt--;
    
                postVotes.innerText = votesInt;
            })
        })
    })


    
}