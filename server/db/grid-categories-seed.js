import db from "#db/client";
import { addCategory } from "#db/queries/grid-categories";

await db.connect();
await seedcatagories();
await db.end();
console.log("🌱 Database seeded.");

async function seedcatagories(){
const categories = [
        //home city, or has battled in 
        // ['Cleveland', 'city','34R1xSji5u4ZORWkNetI' ,null, true]
        // ['New York', 'city', 'za2nHt1bzRQ0xgVRbCg2', null, true]
        // ['Los Angelas', 'city', 'EzOfMEwWjCcQ7OF6lHb9', null, true]
        // ['Austin', 'city', 'CmNo4c2Rjr2PKRLxPlsU', null, true]
        // Lifetime Stats: Wins
        ['Lifetime wins >= 7', 'lifetime_wins', null, 7, true],
        ['Lifetime wins >= 10', 'lifetime_wins', null, 10, true],
        ['Lifetime wins >= 13', 'lifetime_wins', null, 13, true],

        // Lifetime Stats: Points
        ['Lifetime Points >= 25', 'lifetime_points', null, 25, true],
        ['Lifetime Points >= 50', 'lifetime_points', null, 50, true],
        ['Lifetime Points >= 60', 'lifetime_points', null, 60, true],

        // Lifetime Stats: Matches
        ['Lifetime matches >= 10', 'lifetime_matches', null, 10, true],
        ['Lifetime matches >= 20', 'lifetime_matches', null, 20, true],
        ['Lifetime matches >= 25', 'lifetime_matches', null, 25, true],

        // Lifetime Stats: Podcast Appearances
        ['Lifetime podcast appearances >= 5', 'lifetime_podcast_appearances', null, 5, true],
        ['Lifetime podcast appearances >= 8', 'lifetime_podcast_appearances', null, 8, true],
        ['Lifetime podcast appearances >= 10', 'lifetime_podcast_appearances', null, 10, true],

        // Season Stats: Wins
        ['Season wins >= 3', 'season_wins', null, 3, true],
        ['Season wins >= 5', 'season_wins', null, 5, true],
        ['Season wins >= 9', 'season_wins', null, 9, true],

        // Season Stats: Losses
        ['Season losses >= 3', 'season_losses', null, 3, true],
        ['Season losses >= 5', 'season_losses', null, 5, true],
        ['Season losses >= 9', 'season_losses', null, 9, true],

        // Season Stats: Draws
        ['Season draws >= 1', 'season_draws', null, 1, true],

        // Season Stats: Podcast Appearances
        ['Season podcast appearances >= 5', 'season_podcast_appearances', null, 5, true],
        ['Season podcast appearances >= 7', 'season_podcast_appearances', null, 7, true],
        ['Season podcast appearances >= 9', 'season_podcast_appearances', null, 9, true],
        ['Season podcast appearances >= 11', 'season_podcast_appearances', null, 11, true],

        // Season Stats: Points
        ['Season points >= 30', 'season_points', null, 30, true],
        ['Season points >= 40', 'season_points', null, 40, true],
        ['Season points >= 50', 'season_points', null, 50, true],

        // Rankings & Specials
        ['Current top 8 this season', 'current_top_8', null, 8, true],
        ['Had the #1 clip on the podcast', 'number_one_clip_podcast', null, null, true],
        ['Had the #1 clip on the podcast this season', 'number_one_clip_podcast_season', null, null, true]
    ];

    try {
        for (const category of categories){
        const newCategory = await addCategory(category)
        } 
    }catch (err) {
        console.error("Error seeding categories:", err);
    }
};