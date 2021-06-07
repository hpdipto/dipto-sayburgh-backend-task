# dipto-sayburg-backend-task

The assigned backend task is completed and merged from `dev` branch to `main` branch.

To run this project, MongoDB should keep running in backgroun with default settings.

Then we need to run the following commands consecutively:

`npm install`

`npm start` or `npm run dev`

As the backend is developed with GraphQL so additional documentation is not provided as it comes default with GraphQL. GraphQL playground can be found in the root path: `http://localhost:5000/`.

For providing authorization token, its required to provide the token from the bottom of the playground as follow:

![Token Example](/images/token.png)

### Additional Note

Its better to avoid adding the `.env` file into git but for the sake of simplicity, the `.env` file is not added to `.gitignore`.
