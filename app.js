const {
  posts,
  dcard
} = require('dcard');
const fs = require('fs');

const LIMIT = new Date('2017-01-01T00:00:00.000Z');

function leftPad(s) {
  return s.toString().padStart(2, 0)
}

async function main() {
  try {
    let list = [];
    while (!list.slice(-1)[0] || list.slice(-1)[0].createdAt > LIMIT) {
      const lastPost = list.slice(-1)[0];
      const postList = (await posts.listPost({
          forum: 'ncue',
          popular: false,
          before: (lastPost) ? lastPost.id : 2147483647
        }))
        .map((e) => ({
          id: e.id,
          title: e.title,
          createdAt: new Date(e.createdAt)
        }))
        .filter((e) => e.createdAt > LIMIT && !e.title.startsWith('#課程') && !e.title.startsWith('＃課程'));
      if (!postList.slice(-1)[0])
        break;
      list = list.concat(postList);
    }
    const container = {};
    list.forEach((e) => {
      const date = `${leftPad(e.createdAt.getMonth() + 1)}/${leftPad(e.createdAt.getDate())}`;
      const day = container[date];
      if (!day)
        container[date] = [e];
      else
        day.push(e);
    });
    // console.dir(container, {
    //   colors: true
    // })
    const sorted = Object.keys(container).sort((a, b) => (container[a].length < container[b].length) ? 1 : -1);
    sorted.forEach((e) => console.log(`${e}: ${container[e].length}`));
    // console.dir(sorted, {
    //   colors: true
    // })
    let sortedList = [];
    sorted.forEach((e) => sortedList = sortedList.concat(container[e]));
    fs.writeFileSync('所有文章.csv', '\ufeff' + sortedList.map((e) => {
      const date = e.createdAt;
      const month = `${date.getFullYear()}-${date.getMonth() + 1}`
      return `"${e.title}", ${month}, ${month}-${date.getDate()}`
    }).join('\n'), 'utf8')

    fs.writeFileSync('每日文章數量.csv', '\ufeff' + sorted.map((e) => `${e}, ${container[e].length}`).join('\n'), 'utf8')
  } catch (err) {
    console.error(err);
  }
}

main();
