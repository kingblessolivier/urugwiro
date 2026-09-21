import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface DigitalTwinViewerProps {
    listingId: string;
    modelUrl?: string; // URL to the .gltf or .glb model
}

const DigitalTwinViewer: React.FC<DigitalTwinViewerProps> = ({ listingId, modelUrl }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a0a);

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(8, 8, 8);

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        mountRef.current.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0xffffff, 100);
        spotLight.position.set(10, 15, 10);
        spotLight.castShadow = true;
        scene.add(spotLight);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
        scene.add(hemiLight);

        // Grid helper for spatial reference
        const gridHelper = new THREE.GridHelper(20, 20, 0x222222, 0x111111);
        scene.add(gridHelper);

        // Model Loading Logic
        const loader = new GLTFLoader();

        if (modelUrl) {
            loader.load(
                modelUrl,
                (gltf) => {
                    const model = gltf.scene;

                    // Center the model
                    const box = new THREE.Box3().setFromObject(model);
                    const center = box.getCenter(new THREE.Vector3());
                    model.position.x += (model.position.x - center.x);
                    model.position.y += (model.position.y - center.y);
                    model.position.z += (model.position.z - center.z);

                    scene.add(model);
                    setIsLoading(false);
                },
                () => {
                    // Progress could be tracked here
                },
                (error) => {
                    console.error('Error loading GLTF model:', error);
                    setError('Failed to load 3D model');
                    loadFallbackModel(scene);
                    setIsLoading(false);
                }
            );
        } else {
            loadFallbackModel(scene);
            setTimeout(() => setIsLoading(false), 0);
        }

        function loadFallbackModel(scene: THREE.Scene) {
            // Procedural Building Fallback
            const geometry = new THREE.BoxGeometry(4, 6, 4);
            const material = new THREE.MeshStandardMaterial({
                color: 0x333333,
                wireframe: true,
            });
            const building = new THREE.Mesh(geometry, material);
            building.position.y = 3;
            scene.add(building);

            for (let i = 0; i < 6; i++) {
                const roomGeom = new THREE.BoxGeometry(1.2, 1.2, 1.2);
                const roomMat = new THREE.MeshStandardMaterial({ color: 0x00ff00, transparent: true, opacity: 0.3 });
                const room = new THREE.Mesh(roomGeom, roomMat);
                room.position.set(
                    (Math.random() - 0.5) * 3,
                    Math.random() * 5 + 1,
                    (Math.random() - 0.5) * 3
                );
                scene.add(room);
            }
        }

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.maxPolarAngle = Math.PI / 2.1; // Prevent camera from going below ground

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            if (!mountRef.current) return;
            camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };

        window.addEventListener('resize', handleResize);

        // Copy ref to variable for safe cleanup
        const currentMountRef = mountRef.current;

        return () => {
            window.removeEventListener('resize', handleResize);
            if (currentMountRef) {
                currentMountRef.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [listingId, modelUrl]);

    return (
        <div className="w-full h-full relative">
            <div ref={mountRef} className="w-full h-full cursor-move" />

            <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-2">
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/20">
                    {modelUrl ? 'Asset Digital Twin' : 'Procedural Twin Mode'}
                </span>
                {error && (
                    <span className="px-3 py-1 bg-red-500/20 backdrop-blur-md text-red-400 text-[10px] font-bold rounded-full border border-red-500/30">
                        {error}
                    </span>
                )}
            </div>

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-zinc-400 text-sm font-medium tracking-widest uppercase">Loading Spatial Data...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DigitalTwinViewer;
