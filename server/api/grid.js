import {Router} from "express";
import{getCategories, isGridSolvable} from "#db/queries/grid-categories"

const router = Router();

router.get("/", async(req,res)=>{
    // const categories = await getCategories();
    // const grid = await generateGrid()
    const grid = await validateGrid()
    // const solvable = await isGridSolvable(grid)
    // console.log(solvable)
    return res.status(200).json(grid)
})

export default router;


function getRandomCategories(array, count) {
    const shuffleArray = [...array].sort(()=>Math.random() - 0.5)
    const selection = shuffleArray.slice(0, count)
    return selection
}

async function generateGrid(){
    const gridSize = 2 // 2x2 matrix
    //get all categories 
    //randomize and select for rows 
    // filter selected rows from categories
    //select random rows from filtered array for col
    //define grid object {row 1, row 2, ..., col1, col2, ...}
    const allCategories = await getCategories();
    const rowCategories = getRandomCategories(allCategories, gridSize);
    const rowIds = rowCategories.map((row)=>row.id);
    // console.log(rowCategories)
    const filterRows = allCategories.filter((c)=>!rowIds.includes(c.id))
    // console.log(filterRows)
    const colCategories = getRandomCategories(filterRows, gridSize);
    return {rowCategories, colCategories}
}

async function validateGrid(){
    let isSolvable = false;
    let potentialGrid;
    let attempts = 0;
    const maxAttempts = 50; 
    while (!isSolvable && attempts < maxAttempts) {
        attempts++;
        try{
        // Step A: Generate a random 3x3 layout
        potentialGrid = await generateGrid();
        console.log(potentialGrid)

        // Step B: Test if all 9 cells have at least one valid battler match
        isSolvable = await isGridSolvable(potentialGrid.rowCategories, potentialGrid.colCategories);

        if (!isSolvable) {
            console.log(`Attempt ${attempts}: Grid had a dead-end cell. Rerolling...`);
        }
        } catch(err){
            console.warn(`Attempt ${attempts} encountered an error during generation/validation:`, err.message)
        }
    }
    if (!isSolvable) {
        throw new Error("Could not find a solvable 3x3 grid after multiple attempts. Check your database category pool.");
    }

    console.log(`Success! Found a 100% solvable grid after ${attempts} attempts.`);
    return potentialGrid
}

//     // Step C: Save the validated grid to your database
//     const query = `
//       INSERT INTO daily_grids (game_date, row_category_ids, col_category_ids)
//       VALUES ($1, $2, $3)
//       ON CONFLICT (game_date) 
//       DO UPDATE SET row_category_ids = $2, col_category_ids = $3
//       RETURNING *;
//     `;

//     const rowIds = potentialGrid.rows.map(r => r.id);
//     const colIds = potentialGrid.cols.map(c => c.id);

//     const { rows } = await db.query(query, [targetDate, rowIds, colIds]);
//     return rows[0];
// }


//function takes the category type
// pulls the sql from the object
//if the type has params, gets params, 
// dynamicaaly build sql query 




