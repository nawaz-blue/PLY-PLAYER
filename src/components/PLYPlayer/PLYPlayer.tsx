import React, { useRef, useEffect, useState, SetStateAction } from 'react';
import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import logo from '../../../public/LOGO.svg';
import UploadToast from '../UploadToast/UploadToast';
import { Link } from 'react-router-dom';

interface Props {
  mandibularFiles: File[];
  maxillaryFiles: File[];
  uploadPercentage?: number;
  timeElapsed?: number;
  setMaxillaryFiles:React.Dispatch<SetStateAction<File[]>>
  setMandibularFiles:React.Dispatch<SetStateAction<File[]>>
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

    window.addEventListener('resize', onWindowResize, false);
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
      {props.uploadPercentage ? (
        <UploadToast
          uploadPercentage={props.uploadPercentage}
          timeElapsed={props.timeElapsed ? props.timeElapsed : 0}
        />
      ) : (
        ''
      )}

      <div
        style={{
          background: '#282828',
        }}
        className='p-6'
      >
        <div className='flex justify-between align-middle'>
          <div>
            <Link to='download'>
              <button
                type='button'
                className='text-white bg-gray-700 py-4 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 rounded-full text-sm px-8 dark:bg-gray-600 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800'
              >
                All Models
              </button>
            </Link>

            <button
              type='button'
              className='text-white ml-4 bg-gray-700 py-4 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 rounded-full text-sm px-8 dark:bg-gray-600 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800'
              onClick={()=>{
                props.setMandibularFiles([])
                props.setMaxillaryFiles([])
              }}
            >
              Upload New
            </button>
          </div>

          <img src={logo} />
          <div className=''></div>
        </div>
        <div
          className='m-8'
          style={{
            minHeight: '700px',
          }}
          ref={containerRef}
        ></div>
        <div
          style={{
            position: 'absolute',
            top: '90%',
            left: '80%',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
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
            position: 'absolute',
            top: '90%',
            left: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transform: 'translateX(-50%)',
          }}
        >
          <button onClick={prevModel} className='mx-6'>
            <svg
              className='w-6 h-6 text-white dark:text-white'
              aria-hidden='true'
              xmlns='http://www.w3.org/2000/svg'
              fill='currentColor'
              viewBox='0 0 12 16'
            >
              <path d='M10.819.4a1.974 1.974 0 0 0-2.147.33l-6.5 5.773A2.014 2.014 0 0 0 2 6.7V1a1 1 0 0 0-2 0v14a1 1 0 1 0 2 0V9.3c.055.068.114.133.177.194l6.5 5.773a1.982 1.982 0 0 0 2.147.33A1.977 1.977 0 0 0 12 13.773V2.227A1.977 1.977 0 0 0 10.819.4Z' />
            </svg>
          </button>
          <button onClick={playPause}>
            {isPlaying ? (
              <>
                <svg
                  className='w-6 h-6 text-white dark:text-white'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='currentColor'
                  viewBox='0 0 12 16'
                >
                  <path d='M3 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm7 0H9a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Z' />
                </svg>
              </>
            ) : (
              <>
                <svg
                  className='w-6 h-6 text-white dark:text-white'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='currentColor'
                  viewBox='0 0 14 16'
                >
                  <path d='M0 .984v14.032a1 1 0 0 0 1.506.845l12.006-7.016a.974.974 0 0 0 0-1.69L1.506.139A1 1 0 0 0 0 .984Z' />
                </svg>
              </>
            )}
          </button>
          <button onClick={nextModel} className='mx-6'>
            <svg
              className='w-6 h-6 text-white dark:text-white'
              aria-hidden='true'
              xmlns='http://www.w3.org/2000/svg'
              fill='currentColor'
              viewBox='0 0 12 16'
            >
              <path d='M11 0a1 1 0 0 0-1 1v5.7a2.028 2.028 0 0 0-.177-.194L3.33.732A2 2 0 0 0 0 2.227v11.546A1.977 1.977 0 0 0 1.181 15.6a1.982 1.982 0 0 0 2.147-.33l6.5-5.773A1.88 1.88 0 0 0 10 9.3V15a1 1 0 1 0 2 0V1a1 1 0 0 0-1-1Z' />
            </svg>
          </button>
        </div>

        {/* Timeline */}
        {/* <div>
          
        </div>
        <div className='bg-red-100 w-[70%] flex justify-start'>
          <div className='w-9/12 bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700'>
            <div
              className='bg-blue-600 h-2.5 rounded-full dark:bg-blue-500'
              style={{ width: '45%' }}
            ></div>
          </div>
        </div> */}

        <div
          style={{
            position: 'absolute',
            top: '95%',
            left: '50%',
            width: '50%',
            transform: 'translateX(-50%)',
            borderRadius: '50px',
          }}
          onClick={updateTimeline}
        >
          <div
            style={{
              width: '100%',
              height: '10px',
              backgroundColor: '#ccc',
              position: 'relative',
              borderRadius: '50px',
            }}
          >
            <div
              style={{
                width: `${
                  (currentModelIndex / props.mandibularFiles.length) * 100
                }%`,
                height: '100%',
                backgroundColor: '#007bff',

                borderRadius: '50px',
              }}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PLYPlayer;
