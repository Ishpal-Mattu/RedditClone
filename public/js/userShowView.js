const seeUserCommentsButton = document.getElementById('show-user-comments-button');
seeUserCommentsButton.addEventListener('click', () => {
    let url = BASE_URL + "user/current";
    let userId = "";

    fetch(url, options)
    .then(response => response.json())
    .then((data) => {
        userId = data.payload.id;
    })
    .then(() => {
        url = BASE_URL + `user/${userId}/comments`;
        fetch(url, options)
        .then(response => response.json())
        .then((theResponse) => {
            // Create table
            const commentTable = document.createElement('table');
            commentTable.setAttribute('id', 'user-comments');

            // Append table body to table
            const tableBody = document.createElement('tbody');
            let tableRow = document.createElement('tr');
            let tableData;

            for(let i = 0; i < theResponse.payload.length; i++)
            {
                tableRow = document.createElement('tr');

                tableData = document.createElement('td');
                tableData.innerText = theResponse.payload[i].content;
                tableRow.appendChild(tableData);

                tableData = document.createElement('td');
                tableData.innerText = theResponse.payload[i].post.title;
                tableRow.appendChild(tableData);

                const theDate = new Date(theResponse.payload[i].createdAt);
                tableData = document.createElement('td');
                tableData.innerText = theDate
                tableRow.appendChild(tableData);

                

                tableBody.appendChild(tableRow);

                
            }
            

            commentTable.appendChild(tableBody);

            document.body.appendChild(commentTable);


            seeUserCommentsButton.style.display = "none";
        })
    })
})

const seeUserPostsButton = document.getElementById('show-user-posts-button');
seeUserPostsButton.addEventListener('click', () => {
    let url = BASE_URL + "user/current";
    let userId = "";

    fetch(url, options)
    .then(response => response.json())
    .then((data) => {
        userId = data.payload.id;
    })
    .then(() => {
        url = BASE_URL + `user/${userId}/posts`;
        fetch(url, options)
        .then(response => response.json())
        .then((theResponse) => {
            // Create table
            const postTable = document.createElement('table');
            postTable.setAttribute('id', 'user-posts');

            // Append table body to table
            const tableBody = document.createElement('tbody');
            let tableRow = document.createElement('tr');
            let tableData;

            for(let i = 0; i < theResponse.payload.length; i++)
            {
                tableRow = document.createElement('tr');
                tableData = document.createElement('td');
                tableData.innerText = theResponse.payload[i].title;
                tableRow.appendChild(tableData);

                const theDate = new Date(theResponse.payload[i].createdAt);
                tableData = document.createElement('td');
                tableData.innerText = theDate
                tableRow.appendChild(tableData);

                tableBody.appendChild(tableRow);
            }

            postTable.appendChild(tableBody);

            document.body.appendChild(postTable);


            seeUserPostsButton.style.display = "none";
        })
    })
})

const commentVotesButton = document.getElementById('show-user-comment-votes-button');
commentVotesButton.addEventListener('click', () => {
    let url = BASE_URL + "user/current";
    let userId = "";

    fetch(url, options)
    .then(response => response.json())
    .then((data) => {
        userId = data.payload.id;
    })
    .then(() => {
        url = BASE_URL + `user/${userId}/commentvotes`;
        fetch(url, options)
        .then(response => response.json())
        .then((theResponse) => {
            // Create table
            const commentTable = document.createElement('table');
            commentTable.setAttribute('id', 'user-comment-votes');

            // Append table body to table
            const tableBody = document.createElement('tbody');
            let tableRow = document.createElement('tr');
            let tableData;

            for(let i = 0; i < theResponse.payload.length; i++)
            {
                tableRow = document.createElement('tr');
                tableData = document.createElement('td');
                tableData.innerText = theResponse.payload[i].content;
                tableRow.appendChild(tableData);

                const theDate = new Date(theResponse.payload[i].createdAt);
                tableData = document.createElement('td');
                tableData.innerText = theDate
                tableRow.appendChild(tableData);

                tableBody.appendChild(tableRow);
            }

            commentTable.appendChild(tableBody);

            document.body.appendChild(commentTable);


            commentVotesButton.style.display = "none";
        })
    })
})


const postVotesButton = document.getElementById('show-user-post-votes-button');
postVotesButton.addEventListener('click', () => {
    let url = BASE_URL + "user/current";
    let userId = "";

    fetch(url, options)
    .then(response => response.json())
    .then((data) => {
        userId = data.payload.id;
    })
    .then(() => {
        url = BASE_URL + `user/${userId}/postvotes`;
        fetch(url, options)
        .then(response => response.json())
        .then((theResponse) => {
            // Create table
            const postTable = document.createElement('table');
            postTable.setAttribute('id', 'user-post-votes');

            // Append table body to table
            const tableBody = document.createElement('tbody');
            let tableRow = document.createElement('tr');
            let tableData;

            for(let i = 0; i < theResponse.payload.length; i++)
            {
                tableRow = document.createElement('tr');
                tableData = document.createElement('td');
                tableData.innerText = theResponse.payload[i].title;
                tableRow.appendChild(tableData);

                const theDate = new Date(theResponse.payload[i].createdAt);
                tableData = document.createElement('td');
                tableData.innerText = theDate
                tableRow.appendChild(tableData);

                tableBody.appendChild(tableRow);
            }

            postTable.appendChild(tableBody);

            document.body.appendChild(postTable);


            postVotesButton.style.display = "none";
        })
    })

})



const commentBookmarksButton = document.getElementById('show-user-comment-bookmarks-button');
commentBookmarksButton.addEventListener('click', () => {
    let url = BASE_URL + "user/current";
    let userId = "";

    fetch(url, options)
    .then(response => response.json())
    .then((data) => {
        userId = data.payload.id;
    })
    .then(() => {
        url = BASE_URL + `user/${userId}/commentbookmarks`;
        fetch(url, options)
        .then(response => response.json())
        .then((theResponse) => {
            // Create table
            const commentTable = document.createElement('table');
            commentTable.setAttribute('id', 'user-comment-bookmarks');

            // Append table body to table
            const tableBody = document.createElement('tbody');
            let tableRow = document.createElement('tr');
            let tableData;

            for(let i = 0; i < theResponse.payload.length; i++)
            {
                tableRow = document.createElement('tr');
                tableData = document.createElement('td');
                tableData.innerText = theResponse.payload[i].content;
                tableRow.appendChild(tableData);

                
                tableData = document.createElement('td');
                tableData.innerText = theResponse.payload[i].post.title;
                tableRow.appendChild(tableData);

                const theDate = new Date(theResponse.payload[i].createdAt);
                tableData = document.createElement('td');
                tableData.innerText = theDate
                tableRow.appendChild(tableData);

                tableData = document.createElement('td');
                tableData.innerText = theResponse.payload[i].user.username;
                tableRow.appendChild(tableData);

                tableBody.appendChild(tableRow);
            }

            commentTable.appendChild(tableBody);

            document.body.appendChild(commentTable);


            commentBookmarksButton.style.display = "none";

        })
    })
})

const postBookmarksButton = document.getElementById('show-user-post-bookmarks-button');
postBookmarksButton.addEventListener('click', () =>{
    let url = BASE_URL + "user/current";
    let userId = "";
    fetch(url, options)
    .then (response => response.json())
    .then((data)=>{
        userId = data.payload.id;
    })
    .then(() => {
        url = BASE_URL + `user/${userId}/postbookmarks`;
        fetch(url, options)
            .then(response => response.json())
            .then((theResponse) => {
                //const theBody = document.getElementsByTagName('body')[0]
                const postTable = document.createElement("table");
                postTable.setAttribute('id', 'user-post-bookmarks');

                // Append table head to table 
                const headers = ['Title', 'Created At', 'Username'];

                //const tableHead = document.createElement('thead');
                let tableRow = document.createElement('tr');
                let tableData;

                // for(let i = 0; i<headers.length; i++)
                // {
                //     tableData = document.createElement('th');
                //     tableData.innerText = headers[i];
                //     tableRow.appendChild(tableData);
                // }
                
                // tableHead.appendChild(tableRow);
                // postTable.appendChild(tableHead);


                // Append table body to table
                const tableBody = document.createElement('tbody');

                for(let i = 0; i < theResponse.payload.length; i++)
                {
                    tableRow = document.createElement('tr');
                    tableData = document.createElement('td');
                    tableData.innerText = theResponse.payload[i].title;
                    tableRow.appendChild(tableData);

                    const theDate = new Date(theResponse.payload[i].createdAt);
                    tableData = document.createElement('td');
                    tableData.innerText = theDate;
                    tableRow.appendChild(tableData);

                    tableData = document.createElement('td');
                    tableData.innerText = theResponse.payload[i].user.username;
                    tableRow.appendChild(tableData);

                    tableBody.appendChild(tableRow);
                }

                postTable.appendChild(tableBody);

                document.body.appendChild(postTable);


                postBookmarksButton.style.display = "none";
            })
            .catch(function(error){
                console.log(error);
            })
    })

})