/* s1_more.js：店面以 1.25 倍繪製。從停車擋間沿自動門右半進去，避開伸到門前的展示架。 */
const entrance = {
  inside:true, door:[-.17,1.50],
  in:[[-.17,.95],[-.17,.65],[-.17,.1],[-.17,-.41]],
  out:[[-.17,.1],[-.17,.65],[-.17,.95]],
};

const regulars = ['消防員','醫生','護士','建築工人'];

export default {t:'conv', lv:{1:{groups:{
  regulars:{...entrance,who:regulars,max:1},
  guests:{...entrance,who:'*',no:regulars,max:2},
}}}};
