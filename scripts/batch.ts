import { theaters } from '../src/data/theaters';
// import fs from 'fs';
// import path from 'path';
import prisma from "../src/lib/prisma";
// import dotenv from 'dotenv';

// // 環境変数の読み込み
// dotenv.config();
// console.log(process.env.POSTGRES_PRISMA_URL);

export async function createScrees() {
    console.log('Seeding data...');

    for (const theater of theaters) {

        // スクリーンを作成
        for (let i = 1; i <= theater.screenCnt; i++) {

            // 同じスクリーン名がある場合はスキップ
            const existingScreen = await prisma.screen.findFirst({
                where: {
                    name: `スクリーン${i}`,
                    theater_id: theater.id
                }
            });

            if (existingScreen) {
                console.log(`スクリーン${i} already exists for theater ${theater.id}, skipping...`);
                continue;
            }

            // Create screen
            await prisma.screen.create({
                data: {
                    name: `スクリーン${i}`,
                    theater_id: theater.id,
                }
            });

            // Create seats for the screen
            const rowCnt = 14; // 固定値
            const columnCnt = 25; // 固定値
            const rows = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').slice(0, rowCnt);

            for (const row of rows) {
                for (let col = 1; col <= columnCnt; col++) {
                    // Check if seat already exists
                    const existingSeat = await prisma.seats.findFirst({
                        where: {
                            row: row,
                            column: col,
                            screen_id: theater.id
                        }
                    });

                    if (existingSeat) {
                        console.log(`Seat ${row}${col} already exists for screen ${theater.id}, skipping...`);
                        continue;
                    }

                    // Create seat
                    await prisma.seats.create({
                        data: {
                            row: row,
                            column: col,
                            screen_id: theater.id
                        }
                    });
                }
            }
        }
    }

    // const screens = await prisma.screen.findMany();

    // const screensWithAdditionalProperty = screens.map(screen => ({
    //     ...screen,
    //     rowCnt: '14',
    //     columnCnt: '25',
    // }));

    // JSONファイルに書き込み
    // const data = JSON.stringify(screensWithAdditionalProperty, null, 2);
    // const filePath = path.join(__dirname, '../src/data/json/screens.json');

    // fs.writeFileSync(filePath, data);

    // console.log('Data exported successfully to', filePath);
}

// export async function createSeats() {
//     console.log('Seeding data...');

//     const fliePath = path.join(__dirname, '../src/data/json/screens.json');
//     const data = fs.readFileSync(fliePath, 'utf-8');
//     const screens = JSON.parse(data);

//     for (const screen of screens) {
//         const rowCnt = parseInt(screen.rowCnt, 10);
//         const columnCnt = parseInt(screen.columnCnt, 10);

//         const rows = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').slice(0, rowCnt);

//         for (const row of rows) {
//             for (let col = 1; col <= columnCnt; col++) {
//                 // Check if seat already exists
//                 const existingSeat = await prisma.seats.findFirst({
//                     where: {
//                         row: row,
//                         column: col,
//                         screen_id: screen.id
//                     }
//                 });

//                 if (existingSeat) {
//                     console.log(`Seat ${row}${col} already exists for screen ${screen.id}, skipping...`);
//                     continue;
//                 }

//                 await prisma.seats.create({
//                     data: {
//                         row: row,
//                         column: col,
//                         screen_id: screen.id,
//                     },
//                 });
//             }
//         }
//     }
// }

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    console.log('command:' + command);

    try {
        if (command === 'createScrees') {
            await createScrees();
            // } else if (command === 'createSeats') {
            //     await createSeats();
        } else {
            console.log('Unknown command');
            return;
        }

        console.log('successfully');
    } catch (error) {
        console.error('Error in batch process:', error);
    }
}

main();