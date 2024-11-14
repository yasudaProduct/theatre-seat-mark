import { theaters } from '../src/data/theaters';
import fs from 'fs';
import path from 'path';
import prisma from "../src/lib/prisma";
// import dotenv from 'dotenv';

// // 環境変数の読み込み
// dotenv.config();
// console.log(process.env.POSTGRES_PRISMA_URL);

async function createScrees() {
    console.log('Seeding data...');

    for (const theater of theaters) {

        for (let i = 1; i <= theater.screenCnt; i++) {

            // Create screen
            await prisma.screen.create({
                data: {
                    name: `スクリーン${i}`,
                    theater_id: theater.id,
                }
            });
        }
    }

    const screens = await prisma.screen.findMany();

    const screensWithAdditionalProperty = screens.map(screen => ({
        ...screen,
        rowCnt: '14',
        columnCnt: '30',
    }));

    const data = JSON.stringify(screensWithAdditionalProperty, null, 2);

    const filePath = path.join(__dirname, '../src/data/json/screens.json');

    fs.writeFileSync(filePath, data);

    console.log('Data exported successfully to', filePath);
}

async function createSeats() {
    console.log('Seeding data...');

    const fliePath = path.join(__dirname, '../src/data/json/screens.json');
    const data = fs.readFileSync(fliePath, 'utf-8');
    const screens = JSON.parse(data);

    for (const screen of screens) {
        const rowCnt = parseInt(screen.rowCnt, 10);
        const columnCnt = parseInt(screen.columnCnt, 10);

        const rows = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').slice(0, rowCnt);

        for (const row of rows) {
            for (let col = 1; col <= columnCnt; col++) {
                await prisma.seats.create({
                    data: {
                        row: row,
                        column: col,
                        screen_id: screen.id,
                    },
                });
            }
        }
    }
}

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    console.log('command:' + command);

    try {
        if (command === 'createScrees') {
            await createScrees();
        } else if (command === 'createSeats') {
            await createSeats();
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