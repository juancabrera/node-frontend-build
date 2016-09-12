import * as babel from 'babel-core'
import path from 'path'
import mkdirp from 'mkdirp'
import fsp from 'fs-promise'
import sass from 'node-sass'
import browsersync from 'browser-sync'
import browserify from 'browserify'
import fs from 'fs'
import express from 'express'

const tasks = new Map()
const bs = browsersync.create()
const app = express()
const appPort = (process.env.PORT | 3000)

function run(task) {
  const start = new Date();
  console.log(`Starting '${task}'...`);
  return Promise.resolve().then(() => tasks.get(task)()).then(() => {
    console.log(`Finished '${task}' after ${new Date().getTime() - start.getTime()}ms`);
  }, err => console.error(err.stack));
}

// JS build
tasks.set('babel', () => {
  const outputPath = './dist/js/main.js'

  return new Promise((res, rej) => {
    browserify("./src/js/main.js")
    .transform("babelify", {presets: ["es2015", "stage-2"]})
    .bundle((err, buf) => {
      if (err) {
        rej(err)
      } else {
        res(fsp.writeFile(outputPath, buf))
      }
    })
  })
})

// SCSS build
tasks.set('scss', () => {
  return new Promise((res, rej) => {
    sass.render({file: './src/scss/main.scss'}, (err, result) => {
      if (err) {
        rej(err)
      } else {
        const outputPath = './dist/css/main.css'
        mkdirp(path.dirname(outputPath), err => {
          if (err) {
            rej(err)
          } else {
            res(fsp.writeFile(outputPath, result.css))
          }
        })
      }
    })
  })
})


// HTML
tasks.set('html', () => {
  return new Promise((res, rej) => {
    res(fsp.copy('./src/index.html', './dist/index.html'))
  })
})

// Build
tasks.set('build', () => {
  return Promise.resolve()
    // TO DO: add 'clean' task
    .then(() => run('babel'))
    .then(() => run('scss'))
    .then(() => run('html'))
});

tasks.set('serve', () => {
  Promise.resolve().then(() => {
    bs.init({
      server: './dist',
      port: 8080
    })
    bs.watch('./src/js/*.js').on('change', () => {
      return Promise.resolve()
        .then(() => bs.notify('Change on JS detected'))
        .then(() => run('babel'))
        .then(() => bs.reload())
        .then(() => bs.notify('JS reloaded'))
    })
    bs.watch('./src/scss/*.scss').on('change', () => {
      return Promise.resolve()
        .then(() => bs.notify('Change on SCSS detected'))
        .then(() => run('scss'))
        .then(() => bs.reload('*.css'))
        .then(() => bs.notify('CSS reloaded'))
    })
    bs.watch('./src/index.html').on('change', () => {
      return Promise.resolve()
        .then(() => bs.notify('Change on HTML detected'))
        .then(() => run('html'))
        .then(() => bs.reload())
        .then(() => bs.notify('HTML reloaded'))
    })
  })
})

tasks.set('start', () => Promise.resolve()
  .then(() => run('build'))
  .then(() => run('serve'))
)

run(process.argv[2] || 'start')

