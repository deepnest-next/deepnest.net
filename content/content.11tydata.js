export default {
	lang: "en",
	dir: "ltr",
	layout: "layouts/home.njk",
};

// export const bundle = {
// 	css: {
// 		draft: `
// @reference "tailwindcss";

// .draft {
//   position: relative;
//   overflow: hidden;
// }

// .draft::before {
//   position: absolute;
//   {#/*top: -500%;*/#}
//   left: -500%;

//   display: block;
//   width: 1000vw;
//   height: 1000vh;

//   transform: rotate(-45deg);
//   content: attr(data-watermark);

//   opacity: 0.10;
//   line-height: 2em;
//   letter-spacing: 2px;
//   color: #999;
// 	font-size: 2.75rem;
// 	z-index: 0
// }
// `
// 	},
// 	js: (`
// 		document.querySelectorAll('.draft').forEach(function(el) {
// 			el.dataset.watermark = ('   '+ el.dataset.watermark + '   ').repeat(20000);
// 		});
// 		`
// 	)
// }
