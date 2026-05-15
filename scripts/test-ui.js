import os from 'os';
import path from 'path';
import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({
        headless: true, // run in headless to be fast
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('BROWSER ERROR:', msg.text());
        } else {
            console.log('BROWSER LOG:', msg.text());
        }
    });

    page.on('dialog', async dialog => {
        console.log('ALERT:', dialog.message());
        await dialog.accept();
    });

    try {
        console.log("Navigating to auth page...");
        await page.goto('http://localhost:3000/auth', { waitUntil: 'networkidle2' });

        // Fill signup/login
        await page.type('input[placeholder="Enter your email"]', 'mrabdullah1028@gmail.com');
        await page.type('input[placeholder="Create a password"]', 'password123'); // assuming standard demo password

        console.log("Clicking Sign In...");
        const buttons = await page.$$('button');
        let signInBtn = buttons[1]; // Index 1 is usually Sign In if it's "Sign Up" / "Sign In"
        // Wait, let's just evaluate
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const signIn = btns.find(b => b.innerText.includes('Sign In'));
            if (signIn) signIn.click();
        });

        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 8000 }).catch(e => console.log("Login nav timeout, maybe already logged in"));

        console.log("Navigating to dashboard/user...");
        await page.goto('http://localhost:3000/dashboard/user', { waitUntil: 'networkidle2' });

        console.log("Typing request...");
        await page.waitForSelector('textarea', { timeout: 5000 });
        await page.type('textarea', 'muje plumber chahiye phase 2 ma');

        console.log("Clicking Generate Match...");
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const gen = btns.find(b => b.innerText.includes('Match'));
            if (gen) gen.click();
        });

        console.log("Waiting for Search steps to finish...");
        // wait for Hire Best Match button to appear
        await page.waitForFunction(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            return btns.some(b => b.innerText.includes('Hire Best Match'));
        }, { timeout: 30000 });

        console.log("Clicking Hire Best Match...");
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const hire = btns.find(b => b.innerText.includes('Hire Best Match'));
            if (hire) hire.click();
        });

        // wait for alert
        await new Promise(r => setTimeout(r, 5000));

    } catch (err) {
        console.log("SCRIPT EXCEPTION:", err);
    } finally {
        await browser.close();
    }
})();
