import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { Stage, useGrow } from "../../lib/common";
import { InfoCard, IntroTitle, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { Apron, Cart, PARKED_Y, Person, Tower, Truck, useT } from "../airport";

/** The busy apron: a parked jet surrounded by service vehicles. */
export const Intro: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const hourAt = wordFrame(scene, "hour", 0, 90);
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [-9 + t * 0.15, 6.5, 12], fov: 42 }} lookAt={[0.5, 2.2, 0]}>
        <Apron />
        <Tower position={[16, 0, -16]} />
        <group position={[0, PARKED_Y, 0]}>
          <Airplane gear={1} />
        </group>
        <Truck position={[-0.6, 0, 4]} color="#e5484d">
          <mesh position={[-0.35, 0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.38, 0.38, 1.3, 20]} />
            <meshStandardMaterial color="#e9edf3" />
          </mesh>
        </Truck>
        {[0, 1, 2].map((i) => (
          <Cart key={i} position={[-4.5 + i * 1.05 + ((t * 0.4) % 1) * 0, 0, 3.2]} seed={i * 3} />
        ))}
        <Person position={[1.5, 0, 2.2]} walk={t} heading={0.4} />
        <Person position={[-2.5, 0, 2.0]} walk={t + 1} heading={-1} />
      </Stage>
      <IntroTitle series="Flying Made Simple" episode={9} title="What Happens Before Takeoff?" subtitle="An airport pit stop 🧳" grow={useGrow(8, 12)} sub={useGrow(28, 200)} />
      <InfoCard corner="bl" show={ramp(frame, hourAt - 5, hourAt + 8)} style={{ bottom: 190 }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>TURNAROUND</div>
        <div style={{ fontSize: 50, fontWeight: 900, color: "#0d2340" }}>⏱️ often under 1 hour</div>
      </InfoCard>
    </AbsoluteFill>
  );
};
