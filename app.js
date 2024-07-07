const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
app.use(express.json())

let database = null
const databasepath = path.join(__dirname, 'moviesData.db')

const intializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasepath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is Running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB Error: ${message(error)}`)
    process.exit(1)
  }
}
intializeDbAndServer()

const convertMovieDbObjectToResponseObject = dbObject => {
    return {
      movieId: dbObject.movie_id,
      directorId: dbObject.director_id,
      movieName: dbObject.movie_name,
      leadActor: dbObject.lead_actor,
    }
  }
 const convertDirectorDbObjectToResponseObject = (dbObject) => {
    return {
      directorId: dbObject.director_id ,
      directorName : dbObject.director_name 
    }
  } 
// API 1 GET All MOVIES LIST 
// Returns a list of all movie names in the movie table

app.get('/movies/' , async (request,response) => {
    const getAllMoviesName = `
    SELECT 
        movie_name
    FROM 
        movie;`
    const moviesArray = await database.all(getAllMoviesName)
    response.send(
        moviesArray.map((eachMovie) => ({movieName : eachMovie.movie_name}))
        )
})

// API 2 POST A NEW MOVIE IN MOVIE TABLE
// Creates a new movie in the movie table. movie_id is auto-incremented

app.post('/movies/', async (request,response) =>{
    const {directorId, movieName, leadActor} = request.body;
    const postNewMovieQuery = `
    INSERT INTO 
        movie (director_id,movie_name,lead_actor)
    VALUES (${directorId} , '${movieName}' , '${leadActor}'); `
    await database.run(postNewMovieQuery)
    response.send("Movie Successfully Added")
})

//API 3 
// Returns a movie based on the movie ID

app.get('/movies/:movieId/', async (request,response) => {
    const {movieId} = request.params
    const getMovieQuery = `
    SELECT 
      *
    FROM 
       movie
    WHERE
      movie_id = ${movieId};`
    const movie = await database.get(getMovieQuery)
    console.log(movieId)
    response.send(convertMovieDbObjectToResponseObject(movie))
  })

// API 4 
// Updates the details of a movie in the movie table based on the movie ID

app.put('/movies/:movieId/', async (request,response) =>{
    const {movieId} = request.params
    const {directorId, movieName, leadActor} = request.body
    const updateMovieDetailQuery = `
    UPDATE
      movie
    SET 
      director_id = ${directorId},
      movie_name = '${movieName}',
      lead_actor = '${leadActor}'
    WHERE 
      movie_id = ${movieId};`
    
    await database.run(updateMovieDetailQuery)
    response.send("Movie Details Updated")
  })

  // API 5
// Deletes a movie from the movie table based on the movie ID

app.delete('/movies/:movieId/', async (request,response) =>{
    const {movieId} = request.params
    const deleteMovieQuery = `
    DELETE FROM
      movie
    WHERE
      movie_id = ${movieId};`
    await database.run(deleteMovieQuery)
    response.send("Movie Removed")
  })

  // API 6
// Returns a list of all directors in the director table
  app.get('/directors/', async (request,response) =>{
    const getAllDirectorsQuery = `
    SELECT 
      *
    FROM 
      director ;`
  const directorArray = await database.all(getAllDirectorsQuery)
    response.send(
      directorArray.map((director) => convertDirectorDbObjectToResponseObject(director))
    )
  })

  // API 7
// Returns a list of all movie names directed by a specific director

app.get('/directors/:directorId/movies/', async (request,response) =>{
    const {directorId} = request.params
    const getDirectorsMovieQuery = `
    SELECT 
      movie_name
    FROM 
      movie 
    WHERE
      director_id = ${directorId};`
  const movies = await database.all(getDirectorsMovieQuery)
    response.send(
      movies.map((eachMovieDirector) => ({movieName : eachMovieDirector.movie_name}))
    )
  })
  
  module.exports = app