import { promises as fs } from 'fs'
import * as theme from 'jsonresume-theme-even'
import { render } from 'resumed'
import puppeteer from 'puppeteer'

const distFolder = 'dist'
await fs.mkdir(distFolder, { recursive: true })

const resume = JSON.parse(await fs.readFile('config/resume.json', 'utf-8'))
const html = await render(resume, theme)

await fs.writeFile(`${distFolder}/resume.html`, html)
console.log('resume.html file created')
const browser = await puppeteer.launch({headless: true})
const page = await browser.newPage()

await page.setContent(html, { waitUntil: 'networkidle0' })
await page.pdf({ path: `${distFolder}/resume.pdf`, format: 'a4', printBackground: true })
console.log('resume.pdf file created')
await browser.close()