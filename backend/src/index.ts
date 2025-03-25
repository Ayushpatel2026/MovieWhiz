import express, {Request, Response} from 'express';
import cors from 'cors';
import "dotenv/config";

const app = express();

// expres automatically parses incoming requests with JSON payloads
app.use(express.json());

// Helps to parse the URL-encoded data
app.use(express.urlencoded({extended: true}));

// Enable CORS - which allows us to specify who can access our API
app.use(cors());

app.get("/api/test", async (req : Request, res : Response) => {
  res.json({message: "Hello World"});
});

app.listen(7000, () => {
  console.log('Server is running on port 7000');
});