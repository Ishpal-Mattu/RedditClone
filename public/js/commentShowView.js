const commentDownvoteButton = document.getElementsByClassName('comment-downvote-button')[0];
commentDownvoteButton.addEventListener('click', () => {
    let commmentId = commentDownvoteButton.getAttribute('comment-id');
    //const postId = commentUpvoteButton.getAttribute('post-id');
    let url = BASE_URL + `comment/${commmentId}`;

    fetch(url, options)
    .then(response => response.json())
    .then((data) => {
        const payload = data.payload;
        
        const parentNode = commentDownvoteButton.parentNode;
    
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
})

const commentUpvoteButton = document.getElementsByClassName('comment-upvote-button')[0];
commentUpvoteButton.addEventListener('click', () => {
    let commmentId = commentUpvoteButton.getAttribute('comment-id');
    //const postId = commentUpvoteButton.getAttribute('post-id');
    let url = BASE_URL + `comment/${commmentId}`;

    fetch(url, options)
    .then(response => response.json())
    .then((data) => {
        const payload = data.payload;
        
        const parentNode = commentUpvoteButton.parentNode;
    
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
})