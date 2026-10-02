const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
// get expenses
app.get("/api/expenses", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        amount::float8 AS amount,
        category,
        to_char(date, 'YYYY-MM-DD') AS date
      FROM expenses
      ORDER BY id
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// get expenses by id

app.get("/api/expenses/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(404).json({ message: "Expense not found" });
    }

    try {
        const result = await pool.query(`
            SELECT
                id,
                title,
                amount::float8 AS amount,
                category,
                to_char(date, 'YYYY-MM-DD') AS date
            FROM expenses
            WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Expense not found" });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


// create expenses
app.post("/api/expenses", async (req, res) => {
    const { title, amount, category, date } = req.body;

    if (
        title === undefined ||
        amount === undefined ||
        category === undefined ||
        date === undefined
    ) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({
            message: "Title must be a non-empty text"
        });
    }

    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({
            message: "Amount must be a number greater than 0"
        });
    }

   

    const allowedCategories = [
        "Food",
        "Transport",
        "Bills",
        "Entertainment",
        "Other"
    ];

    if (!allowedCategories.includes(category)) {
        return res.status(400).json({
            message: "Invalid category"
        });
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
            message: "Date must be in YYYY-MM-DD format"
        });
    }

    try {
        const result = await pool.query(`
            INSERT INTO expenses (title, amount, category, date)
            VALUES ($1, $2, $3, $4)
            RETURNING
                id,
                title,
                amount::float8 AS amount,
                category,
                to_char(date, 'YYYY-MM-DD') AS date
        `, [title.trim(), amount, category, date]);

        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

//update expenses
app.put("/api/expenses/:id", async (req, res) => {
    const id = Number(req.params.id);

    const { title, amount, category, date } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({
        message: "Expense not found"
    });
   }

    if (title === undefined || amount === undefined || category === undefined || date === undefined)
        
    {
        return res.status(400).json({
            message: "All fields are required"
        });
    }
    if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({
            message: "Title must be a non-empty text"
        });
    }

    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({
            message: "Amount must be a number greater than 0"
        });
    }

    const allowedCategories = [
        "Food",
        "Transport",
        "Bills",
        "Entertainment",
        "Other"
    ];

   if (!allowedCategories.includes(category)) {
    return res.status(400).json({
        message: "Invalid category"
    });
     }

   if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
        message: "Date must be in YYYY-MM-DD format"
    });
   }

   try {
    const checkResult = await pool.query(
        "SELECT id FROM expenses WHERE id = $1",
        [id]
    );

    if (checkResult.rows.length === 0) {
        return res.status(404).json({
            message: "Expense not found"
        });
    }
    const result = await pool.query(`
    UPDATE expenses
    SET title = $1,
        amount = $2,
        category = $3,
        date = $4
    WHERE id = $5
     RETURNING
        id,
        title,
        amount::float8 AS amount,
        category,
        to_char(date, 'YYYY-MM-DD') AS date
   `, [title.trim(), amount, category, date, id]);

   res.status(200).json(result.rows[0]);
    }
    catch (error) {
    console.error(error);
    res.status(500).json({
        message: "Server error"
    });
    }


});

//delete expenses
app.delete("/api/expenses/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({
        message: "Expense not found"
    });

    }
    try {
    const result = await pool.query(
        "DELETE FROM expenses WHERE id = $1",
        [id]
    );

    if (result.rowCount === 0) {
        return res.status(404).json({
            message: "Expense not found"
        });
    }

    res.status(200).json({ message: "Expense deleted successfully" });  
   
   
    }
    catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
   
       
}
});




app.listen(3000, () => {
    console.log("Server running on port 3000");
});