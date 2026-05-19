'use client'

export default function GenreFloralBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[#1b1205]"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 13% 12%, rgba(92, 54, 11, 0.55), transparent 34%),
            radial-gradient(circle at 83% 70%, rgba(118, 62, 13, 0.45), transparent 38%),
            radial-gradient(circle at 48% 48%, rgba(255, 239, 196, 0.08), transparent 44%),
            linear-gradient(135deg, #120b03 0%, #261805 48%, #100a03 100%)
          `,
        }}
      />

      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full opacity-75"
      >
        <defs>
          <pattern id="fineSpecks" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="13" cy="18" r="1.4" fill="#fff4d2" opacity="0.35" />
            <circle cx="46" cy="33" r="1" fill="#fff4d2" opacity="0.25" />
            <circle cx="70" cy="63" r="1.2" fill="#fff4d2" opacity="0.2" />
          </pattern>
        </defs>

        <rect width="1600" height="900" fill="url(#fineSpecks)" opacity="0.42" />
      </svg>

      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full opacity-80"
      >
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M-150 760 C95 590, 305 510, 552 474 C790 440, 930 305, 1120 210 C1325 108, 1490 72, 1740 30"
            stroke="#f8ecd0"
            strokeWidth="8"
            opacity="0.75"
          />
          <path
            d="M-150 810 C130 620, 365 552, 615 525 C855 499, 1005 365, 1215 278 C1395 203, 1540 165, 1740 115"
            stroke="#fff8df"
            strokeWidth="4"
            opacity="0.68"
          />
          <path
            d="M-150 865 C180 685, 435 620, 705 600 C940 582, 1118 470, 1310 386 C1485 310, 1605 265, 1745 238"
            stroke="#d9c292"
            strokeWidth="5"
            opacity="0.48"
          />

          <path
            d="M975 925 C968 785, 1035 650, 1164 554 C1288 462, 1338 360, 1295 270 C1245 165, 1112 185, 1118 294 C1125 395, 1248 414, 1288 328"
            stroke="#f8ecd0"
            strokeWidth="8"
            opacity="0.62"
          />

          <path
            d="M-95 350 C65 288, 170 215, 210 112 C252 5, 380 4, 405 102 C430 202, 300 260, 212 170"
            stroke="#f8ecd0"
            strokeWidth="8"
            opacity="0.58"
          />

          <path
            d="M118 665 C130 540, 195 455, 300 405 C420 348, 525 305, 640 210"
            stroke="#fff8df"
            strokeWidth="4"
            opacity="0.46"
          />

          <path
            d="M1300 85 C1192 172, 1130 255, 1098 352 C1064 458, 995 526, 878 588"
            stroke="#fff8df"
            strokeWidth="4"
            opacity="0.46"
          />

          <path
            d="M500 895 C555 745, 658 642, 805 585 C965 522, 1075 430, 1155 292"
            stroke="#f8ecd0"
            strokeWidth="3"
            opacity="0.38"
          />

          <path
            d="M1080 -40 C1035 92, 970 190, 860 288 C748 390, 650 478, 585 620"
            stroke="#d9c292"
            strokeWidth="3"
            opacity="0.34"
          />
        </g>
      </svg>

      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full opacity-70"
      >
        <g fill="none" stroke="#fff8df" strokeLinecap="round">
          <path
            d="M120 110 C250 60, 380 115, 430 220 C480 325, 350 390, 285 320 C230 260, 290 190, 365 220"
            strokeDasharray="3 11"
            strokeWidth="2.5"
            opacity="0.42"
          />

          <path
            d="M1085 110 C1210 60, 1340 105, 1395 215 C1458 342, 1320 408, 1245 338 C1185 282, 1244 195, 1325 220"
            strokeDasharray="3 11"
            strokeWidth="2.5"
            opacity="0.38"
          />

          <path
            d="M450 660 C575 585, 725 615, 785 725 C835 820, 715 885, 652 802 C610 746, 666 688, 730 722"
            strokeDasharray="3 11"
            strokeWidth="2.2"
            opacity="0.32"
          />
        </g>

        <g fill="#fff8df">
          <Sparkle x={535} y={92} size={30} />
          <Sparkle x={750} y={215} size={23} />
          <Sparkle x={1012} y={186} size={20} />
          <Sparkle x={1320} y={72} size={32} />
          <Sparkle x={215} y={430} size={25} />
          <Sparkle x={1210} y={585} size={22} />
          <Sparkle x={925} y={745} size={18} />
          <Sparkle x={610} y={675} size={18} />
          <Sparkle x={1420} y={395} size={20} />
        </g>

        <g fill="#fff8df" opacity="0.62">
          {[
            [460, 120],
            [490, 150],
            [520, 108],
            [870, 125],
            [910, 150],
            [945, 116],
            [1040, 272],
            [1080, 298],
            [1120, 252],
            [215, 505],
            [248, 535],
            [288, 490],
            [1335, 470],
            [1375, 495],
            [1420, 455],
            [630, 430],
            [665, 455],
            [695, 418],
          ].map(([cx, cy], index) => (
            <circle key={index} cx={cx} cy={cy} r={index % 3 === 0 ? 2.4 : 1.6} />
          ))}
        </g>
      </svg>

      <svg
        viewBox="0 0 760 760"
        className="absolute left-[-92px] top-[-105px] h-[585px] w-[585px] opacity-95"
      >
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M20 300 C145 160, 285 100, 485 110 C620 118, 720 55, 780 -20"
            stroke="#f8ecd0"
            strokeWidth="9"
            opacity="0.78"
          />
          <path
            d="M-20 405 C120 310, 245 250, 390 255 C535 260, 645 170, 755 95"
            stroke="#fff8df"
            strokeWidth="4"
            opacity="0.64"
          />
          <path
            d="M72 545 C140 410, 245 340, 385 330 C520 320, 630 255, 735 180"
            stroke="#d9c292"
            strokeWidth="4"
            opacity="0.48"
          />

          <path
            d="M120 340 C75 300, 78 235, 128 205 C180 175, 245 202, 255 260 C267 330, 185 378, 120 340"
            stroke="#fff8df"
            strokeWidth="3"
            opacity="0.35"
          />
        </g>

        <g transform="translate(318 176) rotate(-10) scale(1.34)">
          <CreamFlower size={136} />
        </g>

        <g transform="translate(158 278) rotate(-18) scale(1.1)">
          <OrangeFlower size={120} />
        </g>

        <g transform="translate(520 140) rotate(12) scale(0.62)">
          <CreamFlower size={94} />
        </g>

        <g transform="translate(105 560) rotate(8) scale(0.5)">
          <CreamFlower size={84} />
        </g>

        <g transform="translate(80 450) rotate(-12) scale(0.44)">
          <OrangeFlower size={74} />
        </g>

        <g transform="translate(420 55) rotate(8) scale(0.42)">
          <CreamFlower size={78} />
        </g>
      </svg>

      <svg
        viewBox="0 0 900 900"
        className="absolute right-[-92px] bottom-[-120px] h-[765px] w-[765px] opacity-95"
      >
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M80 620 C195 450, 330 350, 520 315 C675 285, 780 185, 900 45"
            stroke="#f8ecd0"
            strokeWidth="10"
            opacity="0.78"
          />
          <path
            d="M0 760 C140 600, 295 510, 470 475 C640 440, 765 335, 910 210"
            stroke="#fff8df"
            strokeWidth="4"
            opacity="0.64"
          />
          <path
            d="M240 845 C270 670, 350 555, 500 500 C640 448, 738 372, 865 245"
            stroke="#d9c292"
            strokeWidth="5"
            opacity="0.48"
          />

          <path
            d="M275 480
               C190 420, 200 305, 292 255
               C390 203, 502 265, 495 375
               C488 480, 360 535, 275 480"
            stroke="#f8ecd0"
            strokeWidth="8"
            opacity="0.58"
          />

          <path
            d="M185 680
               C105 615, 125 500, 230 470
               C330 440, 405 520, 360 612
               C318 700, 238 718, 185 680"
            stroke="#fff8df"
            strokeWidth="5"
            opacity="0.42"
          />

          <path
            d="M575 205 C650 150, 765 152, 810 235 C858 325, 760 402, 675 355 C600 315, 615 230, 690 228"
            stroke="#fff8df"
            strokeWidth="3"
            opacity="0.36"
          />
        </g>

        <g transform="translate(590 565) rotate(-8) scale(1.72)">
          <OrangeFlower size={144} />
        </g>

        <g transform="translate(390 365) rotate(12) scale(1.38)">
          <CreamFlower size={132} />
        </g>

        <g transform="translate(690 280) rotate(-14) scale(0.84)">
          <CreamFlower size={112} />
        </g>

        <g transform="translate(310 690) rotate(18) scale(0.64)">
          <CreamFlower size={98} />
        </g>

        <g transform="translate(235 845) rotate(10) scale(0.6)">
          <OrangeFlower size={90} />
        </g>

        <g transform="translate(775 360) rotate(15) scale(0.54)">
          <OrangeFlower size={82} />
        </g>

        <g transform="translate(520 790) rotate(-10) scale(0.46)">
          <CreamFlower size={82} />
        </g>
      </svg>

      <svg
        viewBox="0 0 700 700"
        className="absolute left-[-70px] bottom-[-82px] h-[490px] w-[490px] opacity-86"
      >
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M35 610 C100 455, 210 360, 360 320 C500 280, 595 220, 700 120"
            stroke="#f8ecd0"
            strokeWidth="5"
            opacity="0.66"
          />
          <path
            d="M-20 530 C95 430, 225 375, 365 375 C515 375, 615 300, 720 215"
            stroke="#fff8df"
            strokeWidth="3"
            opacity="0.56"
          />
          <path
            d="M130 690 C150 565, 220 475, 335 430"
            stroke="#d9c292"
            strokeWidth="4"
            opacity="0.46"
          />
        </g>

        <g transform="translate(340 430) rotate(-8) scale(0.98)">
          <OrangeFlower size={120} />
        </g>

        <g transform="translate(105 265) rotate(12) scale(0.64)">
          <CreamFlower size={102} />
        </g>

        <g transform="translate(215 560) rotate(-12) scale(0.54)">
          <CreamFlower size={90} />
        </g>
      </svg>

      <svg
        viewBox="0 0 700 700"
        className="absolute right-[-85px] top-[-55px] h-[500px] w-[500px] opacity-88"
      >
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M690 70 C560 160, 475 250, 410 370 C355 472, 275 552, 145 680"
            stroke="#f8ecd0"
            strokeWidth="5"
            opacity="0.66"
          />
          <path
            d="M630 10 C520 110, 435 210, 365 335 C305 445, 230 535, 110 655"
            stroke="#fff8df"
            strokeWidth="3"
            opacity="0.56"
          />
        </g>

        <g transform="translate(470 150) rotate(12) scale(0.74)">
          <CreamFlower size={114} />
        </g>

        <g transform="translate(355 300) rotate(-18) scale(0.6)">
          <OrangeFlower size={88} />
        </g>

        <g transform="translate(235 470) rotate(10) scale(0.48)">
          <CreamFlower size={82} />
        </g>
      </svg>

      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full opacity-86"
      >
        <g transform="translate(650 345) scale(0.64)">
          <CreamFlower size={84} />
        </g>

        <g transform="translate(790 615) scale(0.56)">
          <OrangeFlower size={78} />
        </g>

        <g transform="translate(1005 455) scale(0.52)">
          <CreamFlower size={74} />
        </g>

        <g transform="translate(1190 685) scale(0.44)">
          <OrangeFlower size={72} />
        </g>

        <g transform="translate(1455 195) scale(0.48)">
          <CreamFlower size={80} />
        </g>

        <g transform="translate(345 680) scale(0.38)">
          <CreamFlower size={76} />
        </g>

        <g transform="translate(1360 330) scale(0.34)">
          <OrangeFlower size={76} />
        </g>

        <g transform="translate(1110 780) scale(0.34)">
          <CreamFlower size={72} />
        </g>

        <g transform="translate(500 210) scale(0.32)">
          <OrangeFlower size={70} />
        </g>
      </svg>

      <div className="absolute inset-0 bg-black/22" />
    </div>
  )
}

function CreamFlower({ size }: { size: number }) {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((rotation) => (
        <ellipse
          key={rotation}
          cx="0"
          cy={-size * 0.42}
          rx={size * 0.18}
          ry={size * 0.48}
          fill="#f8efd2"
          stroke="#d8c79d"
          strokeWidth="2.5"
          transform={`rotate(${rotation})`}
        />
      ))}

      {[0, 72, 144, 216, 288].map((rotation) => (
        <path
          key={`line-${rotation}`}
          d={`M0 0 C${size * 0.02} ${-size * 0.16}, ${
            size * 0.03
          } ${-size * 0.28}, 0 ${-size * 0.46}`}
          stroke="#8b7655"
          strokeWidth="1.3"
          opacity="0.55"
          fill="none"
          transform={`rotate(${rotation})`}
        />
      ))}

      <circle
        cx="0"
        cy="0"
        r={size * 0.095}
        fill="#e96716"
        stroke="#6d310d"
        strokeWidth="2"
      />
      <circle cx="0" cy="0" r={size * 0.035} fill="#2b1708" opacity="0.85" />
    </g>
  )
}

function OrangeFlower({ size }: { size: number }) {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((rotation) => (
        <ellipse
          key={rotation}
          cx="0"
          cy={-size * 0.42}
          rx={size * 0.2}
          ry={size * 0.5}
          fill="#f07816"
          stroke="#9c3e08"
          strokeWidth="2.5"
          transform={`rotate(${rotation})`}
        />
      ))}

      {[0, 72, 144, 216, 288].map((rotation) => (
        <path
          key={`line-${rotation}`}
          d={`M0 0 C${size * 0.02} ${-size * 0.16}, ${
            size * 0.04
          } ${-size * 0.3}, 0 ${-size * 0.48}`}
          stroke="#6d2605"
          strokeWidth="1.4"
          opacity="0.62"
          fill="none"
          transform={`rotate(${rotation})`}
        />
      ))}

      <circle
        cx="0"
        cy="0"
        r={size * 0.095}
        fill="#f8efd2"
        stroke="#6d310d"
        strokeWidth="2"
      />
      <circle cx="0" cy="0" r={size * 0.035} fill="#2b1708" opacity="0.85" />
    </g>
  )
}

function Sparkle({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M0 ${-size} L0 ${size}`} stroke="#fff8df" strokeWidth="1.6" />
      <path d={`M${-size} 0 L${size} 0`} stroke="#fff8df" strokeWidth="1.6" />
      <path
        d={`M${-size * 0.55} ${-size * 0.55} L${size * 0.55} ${
          size * 0.55
        }`}
        stroke="#fff8df"
        strokeWidth="1"
      />
      <path
        d={`M${size * 0.55} ${-size * 0.55} L${-size * 0.55} ${
          size * 0.55
        }`}
        stroke="#fff8df"
        strokeWidth="1"
      />
      <circle cx="0" cy="0" r="1.8" fill="#fff8df" />
    </g>
  )
}