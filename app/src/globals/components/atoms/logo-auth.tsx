import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, animate } from "framer-motion";

// Centros y radios de los párpados
const PARPADO_IZQ = {
  cx: 58.531296,
  cy: 112.09838,
  rx: 19.693001,
  ry: 22.464426,
};
const PARPADO_DER = {
  cx: 126.64462,
  cy: 111.75204,
  rx: 20.353317,
  ry: 22.546801,
};
const MAX_OFFSET = 4;

const CathubLogoAuth = (props: any) => {
  const svgRef = useRef<SVGSVGElement>(null);
  // Seguimiento del ratón
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const lowerX = useMotionValue(0);
  const lowerY = useMotionValue(0);

  const minimalX = useMotionValue(0);
  const minimalY = useMotionValue(0);
  const xS = useSpring(x, { stiffness: 120, damping: 18 });
  const yS = useSpring(y, { stiffness: 120, damping: 18 });

  // Párpados — ry va de su valor normal a 0 al parpadear
  const blinkRyIzq = useMotionValue(PARPADO_IZQ.ry);
  const blinkRyDer = useMotionValue(PARPADO_DER.ry);

  // Ratón en toda la ventana
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Centro del logo en pantalla
      const logoCX = rect.left + rect.width / 2;
      const logoCY = rect.top + rect.height / 2;

      // Distancia del ratón al centro del logo
      const ox = ((e.clientX - logoCX) / window.innerWidth) * MAX_OFFSET * 2;
      const oy = ((e.clientY - logoCY) / window.innerHeight) * MAX_OFFSET * 2;

      x.set(ox);
      y.set(oy < 0 ? oy * 6 : oy);
      lowerX.set(ox / 3);
      lowerY.set(oy < 0 ? (oy * 6) / 3 : oy / 3);

      minimalX.set(ox / 4);
      minimalY.set(oy < 0 ? (oy * 6) / 4 : oy / 4);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Parpadeo automático aleatorio
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const blink = async () => {
      // Cierra
      await Promise.all([
        animate(blinkRyIzq, 0, { duration: 0.07, ease: "easeIn" }),
        animate(blinkRyDer, 0, { duration: 0.07, ease: "easeIn" }),
      ]);
      // Abre
      await Promise.all([
        animate(blinkRyIzq, PARPADO_IZQ.ry, { duration: 0.1, ease: "easeOut" }),
        animate(blinkRyDer, PARPADO_DER.ry, { duration: 0.1, ease: "easeOut" }),
      ]);
      timeout = setTimeout(blink, 2000 + Math.random() * 3000);
    };
    timeout = setTimeout(blink, 1500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <svg
      width="181.48161mm"
      height="181.48163mm"
      viewBox="0 0 181.48161 181.48163"
      id="svg1"
      xmlSpace="preserve"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      ref={svgRef}
    >
      <defs>
        {/* ClipPath ojo izquierdo — misma elipse que el párpado visible */}
        <clipPath id="clip-ojo-izq">
          <motion.ellipse
            cx={PARPADO_IZQ.cx}
            cy={PARPADO_IZQ.cy}
            rx={PARPADO_IZQ.rx}
            style={{ ry: blinkRyIzq }}
          />
        </clipPath>

        {/* ClipPath ojo derecho */}
        <clipPath id="clip-ojo-der">
          <motion.ellipse
            cx={PARPADO_DER.cx}
            cy={PARPADO_DER.cy}
            rx={PARPADO_DER.rx}
            style={{ ry: blinkRyDer }}
          />
        </clipPath>
      </defs>

      {/* Fondo blanco del sobre */}
      <rect
        style={{
          display: "inline",
          fill: "#ffffff",
          fillOpacity: 1,
          fillRule: "evenodd",
          stroke: "none",
          strokeWidth: 1.47433,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeMiterlimit: 4.9,
          strokeDasharray: "none",
          strokeOpacity: 1,
          paintOrder: "normal",
        }}
        id="rect13"
        width={128.78799}
        height={53.21965}
        x={28.186214}
        y={83.469521}
        ry={1.6341026}
      />

      {/* Pupilas — recortadas por los clipPaths, siguen el ratón */}
      <motion.path
        clipPath="url(#clip-ojo-izq)"
        style={{
          display: "inline",
          fill: "#000000",
          fillOpacity: 1,
          fillRule: "evenodd",
          stroke: "#000000",
          strokeWidth: 0.194398,
          strokeLinecap: "round",
          strokeMiterlimit: 4.9,
          strokeOpacity: 0,
          x: xS,
          y: yS,
        }}
        d="M 74.264016,112.35829 A 14.713851,17.378729 0 0 1 59.556048,129.73702 14.713851,17.378729 0 0 1 44.836319,112.3722 14.713851,17.378729 0 0 1 59.532512,94.979588 14.713851,17.378729 0 0 1 74.263997,112.33051 l -14.713834,0.0278 z"
      />
      <motion.path
        clipPath="url(#clip-ojo-der)"
        style={{
          display: "inline",
          fill: "#000000",
          fillOpacity: 1,
          fillRule: "evenodd",
          stroke: "#000000",
          strokeWidth: 0.201503,
          strokeLinecap: "round",
          strokeMiterlimit: 4.9,
          strokeOpacity: 0,
          x: xS,
          y: yS,
        }}
        d="m 141.34184,111.80822 a 15.402974,17.836962 0 0 1 -15.39682,17.83695 15.402974,17.836962 0 0 1 -15.40912,-17.82269 15.402974,17.836962 0 0 1 15.38451,-17.851224 15.402974,17.836962 0 0 1 15.42142,17.808414 l -15.40298,0.0286 z"
      />

      {/* Cara del gato */}
      <motion.g
        style={{
          x: minimalX,
          y: minimalY,
        }}
      >
        <g
          id="layer4"
          style={{ display: "inline" }}
          transform="translate(-15.180232,-66.123723)"
        >
          <path
            d="m 60.076408,94.285686 c -0.02514,-0.01751 -0.0056,0.006 -0.02042,0.008 -5.377145,5.022982 -10.939083,19.182834 -15.702261,30.746624 -4.763171,11.56378 -7.773166,25.04196 -8.666239,38.12344 -0.893071,13.0815 -0.623277,25.0573 3.306899,35.49178 1.170454,3.10751 12.865763,19.24053 20.903646,24.08283 8.037881,4.84226 34.714601,9.1649 48.893657,8.97651 14.82119,-0.19695 32.81996,-0.99422 46.58863,-10.72604 11.464,-8.10285 13.81228,-10.04638 19.42494,-21.29624 5.80254,-11.63053 6.92555,-23.33948 6.10685,-37.216 -0.81872,-13.8765 -4.6518,-26.78716 -8.14977,-38.27861 -3.49796,-11.49146 -12.45104,-28.991807 -13.44514,-29.328618 -0.89968,-0.30482 -16.05713,19.113418 -20.058,27.946148 -3.4901,7.70515 -6.2375,16.35221 -6.52846,17.38909 -0.24032,0.85646 -8.40413,-2.46831 -13.01845,-3.40784 -4.61431,-0.93954 -16.43156,-1.02818 -21.668782,-0.0204 -4.361226,0.83923 -12.712852,2.98339 -13.499529,3.20019 -0.835997,0.23041 -2.903435,-9.16126 -6.847973,-16.9668 -3.697983,-7.3177 -14.596636,-25.454463 -17.597977,-28.679286 -0.01483,-0.011 -0.01487,-0.03062 -0.02163,-0.04463 z m 80.658152,62.551494 c 9.30769,0.0195 15.61606,5.6552 18.21389,16.65843 2.22286,9.41502 -0.4536,18.70136 -6.33912,22.94503 -5.88549,4.24367 -16.19402,3.94896 -22.71912,-1.27505 -6.52513,-5.22401 -7.90468,-15.26885 -6.82359,-23.68562 1.08106,-8.41676 9.70035,-14.65958 17.66794,-14.64279 z m -67.88683,0.37085 c 7.823859,-0.34518 16.973787,5.6577 18.054871,14.07446 1.081077,8.41679 0.108467,18.48794 -6.416601,23.71193 -6.525115,5.22399 -13.162664,4.90227 -20.410178,2.6099 -7.000421,-2.21419 -11.377554,-14.41774 -9.215566,-23.84566 2.597813,-11.32846 10.16363,-16.20547 17.987474,-16.55063 z"
            style={{
              display: "inline",
              opacity: 1,
              mixBlendMode: "lighten",
              fill: "#ffffff",
              fillOpacity: 1,
              fillRule: "evenodd",
              stroke: "#131313",
              strokeWidth: 3.948,
              strokeLinecap: "round",
              strokeLinejoin: "miter",
              strokeMiterlimit: 4.9,
              strokeDasharray: "none",
              strokeOpacity: 1,
              paintOrder: "normal",
            }}
            id="path4"
          />
        </g>
      </motion.g>

      {/* Párpados visibles — se cierran al parpadear */}
      <motion.ellipse
        id="parpado-izquierdo"
        cx={PARPADO_IZQ.cx}
        cy={PARPADO_IZQ.cy}
        rx={PARPADO_IZQ.rx}
        style={{
          ry: blinkRyIzq,
          fill: "none",
          stroke: "#000000",
          strokeWidth: 3.58144,
          strokeDasharray: "none",
          strokeOpacity: 1,
        }}
      />
      <motion.ellipse
        id="parpado-derecho"
        cx={PARPADO_DER.cx}
        cy={PARPADO_DER.cy}
        rx={PARPADO_DER.rx}
        style={{
          ry: blinkRyDer,
          fill: "none",
          stroke: "#000000",
          strokeWidth: 3.64758,
          strokeDasharray: "none",
          strokeOpacity: 1,
        }}
      />

      {/* Sobre */}
      <motion.g style={{ x: lowerX, y: lowerY }}>
        <g
          id="sobre"
          style={{ display: "inline" }}
          transform="translate(-15.180232,-66.123723)"
        >
          <rect
            style={{
              fill: "#ffffff",
              fillOpacity: 1,
              fillRule: "evenodd",
              stroke: "#000000",
              strokeWidth: 2.14617,
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeMiterlimit: 4.9,
              strokeDasharray: "none",
              strokeOpacity: 1,
              paintOrder: "normal",
            }}
            id="rect6"
            width={68.032043}
            height={39.650787}
            x={73.882179}
            y={204.5621}
            ry={1.9709457}
          />
          <path
            style={{
              fill: "#ffffff",
              fillOpacity: 1,
              fillRule: "evenodd",
              stroke: "#000000",
              strokeWidth: 1.26363,
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeMiterlimit: 4.9,
              strokeDasharray: "none",
              strokeOpacity: 1,
              paintOrder: "normal",
            }}
            id="path7"
            d="m 120.49127,215.30853 -19.01172,3.46587 -17.305503,3.51023 6.504328,-18.19757 5.612803,-16.74212 12.507392,14.7317 z"
            transform="matrix(0.55994708,0.89039259,-1.642485,0.3115729,393.81197,60.332891)"
          />
          <path
            style={{
              fill: "#000000",
              fillOpacity: 1,
              fillRule: "evenodd",
              stroke: "#000000",
              strokeWidth: 1.74722,
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeMiterlimit: 4.9,
              strokeDasharray: "none",
              strokeOpacity: 1,
              paintOrder: "normal",
            }}
            d="m 103.79072,225.10245 c 2.05759,0.01 3.73944,2.93021 3.73944,2.93021 0,0 2.28565,-2.86098 4.1995,-2.84567 1.91385,0.0153 4.22207,1.24391 4.17113,4.76988 -0.0509,3.52595 -8.31388,8.15754 -8.31388,8.15754 0,0 -8.49561,-4.36999 -8.398999,-8.34725 0.09664,-3.97725 2.545219,-4.67344 4.602809,-4.66471 z"
            id="path10"
          />
        </g>
      </motion.g>

      {/* Morro */}
      <motion.g
        id="morro"
        style={{
          x: lowerX,
          y: lowerY,
        }}
      >
        <path
          style={{
            display: "inline",
            fill: "#ffffff",
            fillOpacity: 1,
            fillRule: "evenodd",
            stroke: "#000000",
            strokeWidth: 2.7,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeMiterlimit: 4.9,
            strokeDasharray: "none",
            strokeOpacity: 1,
            paintOrder: "normal",
          }}
          d="m 101.2867,205.3072 c 0.92259,1.56784 2.20174,3.45826 4.19411,4.51106 1.99238,1.05279 4.69783,1.26787 6.53736,1.05844 1.83953,-0.20943 2.81302,-0.84333 3.60341,-1.42009 0.7904,-0.57676 1.60499,-1.27377 2.01496,-1.16196 0.40997,0.11181 1.26585,1.26442 3.36171,1.92801 2.09585,0.6636 5.64937,1.13158 8.08324,0.14672 2.43387,-0.98487 3.74784,-3.42254 4.6652,-5.10552 0.91736,-1.68297 1.43808,-2.61122 -4.38057,-3.15459 -5.81866,-0.54337 -17.97622,-0.70185 -23.77211,-0.15847 -5.795892,0.54338 -5.2299,1.78857 -4.30731,3.3564 z"
          id="path6"
          transform="matrix(1.1816241,0,0,1.1285884,-46.460685,-92.953067)"
        />
        <motion.rect
          style={{
            display: "inline",
            fill: "#ffffff",
            fillOpacity: 1,
            fillRule: "evenodd",
            stroke: "#000000",
            strokeWidth: 2.42509,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeMiterlimit: 4.9,
            strokeDasharray: "none",
            strokeOpacity: 0,
            paintOrder: "normal",
          }}
          id="rect12"
          width={46.535042}
          height={4.4446373}
          x={69.30941}
          y={132.85616}
          ry={1.8428982}
        />
      </motion.g>
    </svg>
  );
};

export default CathubLogoAuth;
