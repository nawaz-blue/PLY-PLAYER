import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import logo from "../../../public/LOGO.svg";

interface Props {
  mandibularFiles: File[];
  maxillaryFiles: File[];
}

function PLYPlayer(props: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<any>(null);
  const mandibularRef = useRef<THREE.Mesh | null>(null);
  const maxillaryRef = useRef<THREE.Mesh | null>(null);

  const [cameraPosition, setCameraPosition] = useState({
    x: 0,
    y: 0.15,
    z: 3,
  });
  const [showUpper, setShowUpper] = useState(true);
  const [showLower, setShowLower] = useState(true);

  const init = () => {
    const container = containerRef.current;

    const containerWidth = container ? container.clientWidth : 0;
    const containerHeight = container ? container.clientHeight : 0;

    cameraRef.current = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      1,
      15
    );
    cameraRef.current.position.set(0, 0.15, 3);

    sceneRef.current = new THREE.Scene();
    sceneRef.current.background = new THREE.Color(0x282828);

    const plane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(0.00001, 0.00001),
      new THREE.MeshPhongMaterial({ color: 0x0f0f0f })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.5;
    sceneRef.current.add(plane);

    if (props.mandibularFiles.length > 0) {
      loadPLYModel(props.mandibularFiles[0], 0.02, mandibularRef);
    }
    if (props.maxillaryFiles.length > 0) {
      loadPLYModel(props.maxillaryFiles[0], 0.02, maxillaryRef);
    }

    sceneRef.current.add(new THREE.HemisphereLight(0x443333, 0x000));
    addShadowedLight(1, 1, 1, 0xffffff, 1);

    if (!rendererRef.current) {
      rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
      rendererRef.current.setPixelRatio(window.devicePixelRatio);
      // rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      rendererRef.current.setSize(containerWidth, containerHeight);
      rendererRef.current.outputEncoding = THREE.sRGBEncoding;
      container?.appendChild(rendererRef.current.domElement);
    }

    controlsRef.current = new OrbitControls(
      cameraRef.current,
      rendererRef.current.domElement
    );
    controlsRef.current.minDistance = 2;
    controlsRef.current.maxDistance = 5;

    window.addEventListener("resize", onWindowResize, false);
  };

  const changeModel = (modelIndex: number) => {
    if (props.mandibularFiles.length > 0) {
      loadPLYModel(props.mandibularFiles[modelIndex], 0.02, mandibularRef);
    }
    if (props.maxillaryFiles.length > 0) {
      loadPLYModel(props.maxillaryFiles[modelIndex], 0.02, maxillaryRef);
    }
  };

  const loadPLYModel = (
    file: File,
    scale: number,
    target: React.MutableRefObject<THREE.Mesh | null>
  ) => {
    const loader = new PLYLoader();
    const reader = new FileReader();

    const addMeshToScene = (geometry: THREE.BufferGeometry) => {
      geometry.computeVertexNormals();
      const material = new THREE.MeshStandardMaterial({ vertexColors: true });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.multiplyScalar(scale);

      sceneRef.current?.add(mesh);
      updateTargetMesh(target, mesh);
    };

    const updateTargetMesh = (
      targetRef: React.MutableRefObject<THREE.Mesh | null>,
      newMesh: THREE.Mesh
    ) => {
      if (targetRef.current) {
        sceneRef.current?.remove(targetRef.current);
      }
      targetRef.current = newMesh;
    };

    reader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const geometry = loader.parse(arrayBuffer);
      addMeshToScene(geometry);
    };

    reader.readAsArrayBuffer(file);
  };

  const addShadowedLight = (
    x: number,
    y: number,
    z: number,
    color: number,
    intensity: number
  ) => {
    const directionalLight = new THREE.DirectionalLight(color, intensity);
    directionalLight.position.set(x, y, z);
    sceneRef.current?.add(directionalLight);
    directionalLight.castShadow = true;
    const d = 1;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = d;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 1;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
  };

  const onWindowResize = () => {
    cameraRef.current!.aspect = window.innerWidth / window.innerHeight;
    cameraRef.current!.updateProjectionMatrix();
    rendererRef.current?.setSize(window.innerWidth, window.innerHeight);
  };

  const animate = () => {
    requestAnimationFrame(animate);
    render();
  };

  const updateCameraPosition = (x: number, y: number, z: number) => {
    setShowUpper(true);
    setShowLower(true);
    setCameraPosition({ x, y, z });
    cameraRef.current!.position.set(x, y, z);
    controlsRef.current!.target.set(0, 0.15, 0);
    controlsRef.current!.update();
    animate();
  };

  const toggleUpper = () => {
    setShowUpper(true);
    setShowLower(false);
  };

  const toggleLower = () => {
    setShowLower(true);
    setShowUpper(false);
  };

  useEffect(() => {
    if (mandibularRef.current) {
      mandibularRef.current.visible = showLower;
    }
    if (maxillaryRef.current) {
      maxillaryRef.current.visible = showUpper;
    }
  }, [showLower, showUpper]);

  const render = () => {
    rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
  };

  useEffect(() => {
    cameraRef.current &&
      cameraRef.current.position &&
      cameraRef.current.position.set(
        cameraPosition.x,
        cameraPosition.y,
        cameraPosition.z
      );
  }, [cameraPosition]);

  const [isInitialized, setIsInitialized] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentModelIndex, setCurrentModelIndex] = useState(0);

  const playPause = () => {
    setIsPlaying(!isPlaying);
  };

  const nextModel = () => {
    if (currentModelIndex < props.mandibularFiles.length - 1) {
      setCurrentModelIndex(currentModelIndex + 1);
    }
  };

  const prevModel = () => {
    if (currentModelIndex > 0) {
      setCurrentModelIndex(currentModelIndex - 1);
    }
  };

  const updateTimeline = (event: React.MouseEvent<HTMLDivElement>) => {
    const timelineWidth = event.currentTarget.clientWidth;
    const clickX = event.nativeEvent.offsetX;
    const newModelIndex = Math.floor(
      (clickX / timelineWidth) * props.mandibularFiles.length
    );
    setCurrentModelIndex(newModelIndex);
  };

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        nextModel();
      }, 1350);

      return () => {
        clearInterval(timer);
      };
    }
  }, [isPlaying, currentModelIndex]);

  useEffect(() => {
    changeModel(currentModelIndex);
  }, [currentModelIndex]);

  useEffect(() => {
    if (!isInitialized) {
      init();
      animate();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    init();
  }, [props.mandibularFiles, props.maxillaryFiles]);

  return (
    <>
      <div
        style={{
          background: "#282828",
        }}
        className="p-6"
      >
        <div className="flex justify-between align-middle">
          <button
            type="button"
            className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 rounded-full text-sm px-8 dark:bg-gray-600 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800"
          >
            Patient Details
          </button>
          <img src={logo} />
          <div className="">
            <button
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >
              Download
            </button>
          </div>
        </div>
        <div
          className="m-8"
          style={{
            minHeight: "600px",
          }}
          ref={containerRef}
        ></div>
        <div
          style={{
            position: "absolute",
            top: "90%",
            left: "80%",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <button onClick={toggleUpper}>Upper</button>
          <div>
            <button onClick={() => updateCameraPosition(-4, 0.15, 3)}>
              Left
            </button>
            <button onClick={() => updateCameraPosition(0, 0.15, 3)}>
              Center
            </button>
            <button onClick={() => updateCameraPosition(4, 0.15, 3)}>
              Right
            </button>
          </div>
          <button onClick={toggleLower}>Lower</button>
        </div>
        <div
          style={{
            position: "absolute",
            top: "90%",
            left: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transform: "translateX(-50%)",
          }}
        >
          <button  onClick={prevModel}>Prev</button>
          <button onClick={playPause}>{isPlaying ? "Pause" : "Play"}</button>
          <button onClick={nextModel}>Next</button>
        </div>

        {/* Timeline */}
        <div
          style={{
            position: "absolute",
            top: "95%",
            left: "50%",
            width: "80%",
            transform: "translateX(-50%)",
          }}
          onClick={updateTimeline}
        >
          <div
            style={{
              width: "100%",
              height: "10px",
              backgroundColor: "#ccc",
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${
                  (currentModelIndex / props.mandibularFiles.length) * 100
                }%`,
                height: "100%",
                backgroundColor: "#007bff",
              }}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PLYPlayer;
