import db from "#db/client"; 

export async function addCategory([name, categoryType, targetId, parameter, isActive]) {
    const sql = `
        INSERT INTO categories (name, category_type, target_id, parameter, is_active) 
        VALUES ($1, $2, $3, $4, $5)
    `;
const{rows:[category]} = await db.query(sql, [name, categoryType, targetId, parameter, isActive]);
return category
}

export async function getCategories(){
    const sql = `SELECT * FROM categories`;
    const {rows: categories } = await  db.query(sql)
    return categories;
}

function buildCellQuery(rowCat, colCat) {
  const rowGen = generateSql[rowCat.category_type];
  if(!rowGen){throw new Error(`missing sql generator:${rowCat.category_type}`)}
  const colGen = generateSql[colCat.category_type];
  if(!colGen){throw new Error(`missing sql generator:${colCat.category_type}`)}

  const rowVal = rowCat.target_id || rowCat.parameter;
  const colVal = colCat.target_id || colCat.parameter;

  // Row uses $1
  const { sql: rowSql, param: rowParam } = rowGen(rowVal, '$1');
  // Column uses $2
  const { sql: colSql, param: colParam } = colGen(colVal, '$2');

  const query = `
    SELECT EXISTS (
      SELECT 1 FROM battlers b
      WHERE (${rowSql}) 
        AND (${colSql})
    ) AS has_match;
  `;

  return { query, params: [rowParam, colParam] };
}

export async function isGridSolvable( rowCategories, colCategories ) {
  // Check all 9 cells (3 rows x 3 columns)
//   console.log(rowCategories)
//   console.log(colCategories)
  for (const rowCat of rowCategories) {
    for (const colCat of colCategories) {
      const { query, params } = buildCellQuery(rowCat, colCat);
      
      // Rename destructured result to 'queryResult' so we don't shadow our categories array!
      const { rows: queryResult } = await db.query(query, params);
      
      // If even ONE cell has zero matching battlers, the grid fails validation!
      if (!queryResult[0].has_match) {
        return false; 
      }
    }
  }
  return true; // All 9 cells have at least one valid answer
}

const generateSql = {
    lifetime_wins: (parameter, placeholder) => ({
        sql: `EXISTS (SELECT 1 FROM vw_battler_stats_comprehensive v WHERE v.battler_id = b.id AND v.lifetime_wins >= ${placeholder})`,
        param: parameter
    }),

    lifetime_points: (parameter, placeholder) => ({
        sql: `EXISTS (SELECT 1 FROM vw_battler_stats_comprehensive v WHERE v.battler_id = b.id AND v.lifetime_points >= ${placeholder})`,
        param: parameter
    }),

    lifetime_matches: (parameter, placeholder) => ({
        sql: `EXISTS (SELECT 1 FROM vw_battler_stats_comprehensive v WHERE v.battler_id = b.id AND v.lifetime_matches >= ${placeholder})`,
        param: parameter
    }),

    lifetime_podcast_appearances: (parameter, placeholder) => ({
        sql: `EXISTS (SELECT 1 FROM vw_battler_stats_comprehensive v WHERE v.battler_id = b.id AND v.lifetime_appearances >= ${placeholder})`,
        param: parameter
    }),

    season_wins: (parameter, placeholder) => ({
        sql: `EXISTS (SELECT 1 FROM vw_battler_stats_in_season v WHERE v.battler_id = b.id AND v.in_season_wins >= ${placeholder})`,
        param: parameter
    }),

    season_losses: (parameter, placeholder) => ({
        sql: `EXISTS (SELECT 1 FROM vw_battler_stats_in_season v WHERE v.battler_id = b.id AND v.in_season_losses >= ${placeholder})`,
        param: parameter
    }),

    season_draws: (parameter, placeholder) => ({
        sql: `EXISTS (SELECT 1 FROM vw_battler_stats_in_season v WHERE v.battler_id = b.id AND v.in_season_draws >= ${placeholder})`,
        param: parameter
    }),       
        
    season_podcast_appearances: (parameter, placeholder) => ({
        sql: `EXISTS (SELECT 1 FROM vw_battler_stats_comprehensive v WHERE v.battler_id = b.id AND v.in_season_appearances >= ${placeholder})`,
        param: parameter
    }),       

    season_points: (parameter, placeholder) => ({
        sql: `EXISTS (SELECT 1 FROM vw_battler_stats_comprehensive v WHERE v.battler_id = b.id AND v.in_season_points >= ${placeholder})`,
        param: parameter
    }),
    current_top_8: (parameter, placeholder) => ({
        // Assumes your season view has a rank column (e.g., v.rank or v.season_rank)
        sql: `EXISTS (SELECT 1 FROM vw_battler_stats_comprehensive v WHERE v.battler_id = b.id AND v.rank <= ${placeholder})`,
        param: parameter // Will pass 8
    }),

    // Rankings & Specials: #1 Clip on Podcast (Lifetime)
    number_one_clip_podcast: (parameter, placeholder) => ({
        // Assumes a table tracking podcast clips/rankings
        sql: `EXISTS (SELECT 1 FROM rbl_points p WHERE (p.battler_id1 = b.id OR p.battler_id2 = b.id) AND p.ranking = 1)`,
        param: null // No parameter needed since it's a fixed condition
    }),

    // Rankings & Specials: #1 Clip on Podcast (This Season)
    number_one_clip_podcast_season: (parameter, placeholder) => ({
        // Assumes podcast clips have a season flag or filter
        sql: `EXISTS (SELECT 1 FROM rbl_points p WHERE (p.battler_id1 = b.id OR p.battler_id2 = b.id) AND p.season = ${placeholder} AND p.ranking = 1)`,
        param: parameter // should be 4, current season num
    })
};

    // season_top_8: (parameter)=>({
    //     sql: `SELECT EXISTS (
    //     WITH ranked_battlers AS (
    //         SELECT battler_id,
    //             ROW_NUMBER() OVER (ORDER BY season_points DESC) as rank
    //         FROM vw_battler_stats_comprehensive
    //     )
    //     SELECT 1 
    //     FROM ranked_battlers 
    //     WHERE battler_id = 'S0evx18r6XmyhJfEgn3D' 
    //         AND rank <= 8
    //     ) AS is_in_top_8;`,
    //     param:parameter}),        
//}