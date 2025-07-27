(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/components/Map.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// Fetch floorplans and buildings from API
__turbopack_context__.s({
    "default": ()=>Map
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$zoom$2d$pan$2d$pinch$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-zoom-pan-pinch/dist/index.esm.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
function Map(props) {
    _s();
    // Helper to parse floor type from filename
    function getFloorLabel(filename) {
        // Match _B1FLR, _01FLR, _02FLR, _03FLR, _04FLR, _02FLR_MEZ, etc.
        const match = filename.match(/_((B\d|\d{2})FLR)(?:_MEZ)?/i);
        if (match) {
            const code = match[1].toUpperCase();
            if (filename.toUpperCase().includes('MEZ')) {
                return 'Mezzanine';
            }
            if (code.startsWith('B')) {
                // Basement
                return "Basement ".concat(code[1]);
            } else {
                // Floor number
                const num = parseInt(code.slice(0, 2), 10);
                if (num === 1) return '1st Floor';
                if (num === 2) return '2nd Floor';
                if (num === 3) return '3rd Floor';
                if (num === 4) return '4th Floor';
                return "".concat(num, "th Floor");
            }
        }
        return 'Unknown';
    }
    // Helper to get building code from filename
    function getBuildingCode(filename) {
        // Match: 001DWE_01FLR.pdf, 002E2_01FLR.pdf, 005ML_01FLR.pdf, etc.
        // Building code is after digits and before _
        const match = filename.match(/^\d+([A-Z0-9]+)_/i);
        return match ? match[1] : 'UNKNOWN';
    }
    // Helper to clean floorplan filename to 'BUILDING Floor XX'
    function getCleanFloorplanName(filename) {
        // Example: 019SLC_02FLR_page1.png
        // Extract building code (letters after first digits, before _)
        // Extract floor number (digits after _ and before FLR)
        const match = filename.match(/\d+([A-Z]+)_([0-9]+)FLR/i);
        if (match) {
            const building = match[1];
            const floor = match[2];
            return "".concat(building, " Floor ").concat(floor);
        }
        return filename;
    }
    // Helper to get building code prefix from filename
    function entryCode(building) {
        return building + "_";
    }
    const [floorplans, setFloorplans] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [buildings, setBuildings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const mapImgRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [modalImg, setModalImg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const zoomOffsetX = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const zoomOffsetY = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const zoomScale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(1);
    const [activeBuilding, setActiveBuilding] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const hideDropdownTimeout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Map.useEffect": ()=>{
            fetch("/api/floorplans").then({
                "Map.useEffect": (res)=>res.json()
            }["Map.useEffect"]).then({
                "Map.useEffect": (data)=>{
                    setFloorplans(data.floorplans || []);
                    setBuildings(data.buildings || []);
                }
            }["Map.useEffect"]);
        }
    }["Map.useEffect"], []);
    function getDotSize() {
        const img = mapImgRef.current;
        if (!img) return 12; // fallback
        if (props.aspectRatio) {
            const base = 14;
            const scale = Math.sqrt(props.aspectRatio);
            return Math.max(8, Math.min(20, base * scale));
        }
        const minDim = Math.min(img.clientWidth, img.clientHeight);
        return Math.max(8, Math.min(20, minDim * 0.025));
    }
    function handleClick(event) {
        if (props.disabled) return;
        const img = event.currentTarget;
        const x = event.nativeEvent.offsetX / img.clientWidth;
        const y = event.nativeEvent.offsetY / img.clientHeight;
        props.setXCoor(x);
        props.setYCoor(y);
    }
    const lineStyle = ()=>{
        if (props.xCoor != null && props.yCoor != null && props.xRightCoor != null && props.yRightCoor != null) {
            const parent = document.querySelector(".MapPicture");
            if (!parent) return {};
            const parentWidth = parent.clientWidth;
            const parentHeight = parent.clientHeight;
            const x1 = props.xCoor * parentWidth;
            const y1 = props.yCoor * parentHeight;
            const x2 = props.xRightCoor * parentWidth;
            const y2 = props.yRightCoor * parentHeight;
            const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
            return {
                position: "absolute",
                top: "".concat(y1, "px"),
                left: "".concat(x1, "px"),
                width: "".concat(length, "px"),
                transform: "rotate(".concat(angle, "deg) translate(0, -50%)"),
                transformOrigin: "0 0",
                height: "1.5px",
                backgroundColor: "black"
            };
        }
        return {};
    };
    function handleZoom(ref, _) {
        zoomOffsetX.current = -ref.state.positionX;
        zoomOffsetY.current = -ref.state.positionY;
        zoomScale.current = ref.state.scale;
    }
    function handlePan(ref, _) {
        zoomOffsetX.current = -ref.state.positionX;
        zoomOffsetY.current = -ref.state.positionY;
        zoomScale.current = ref.state.scale;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full h-full bg-gray-50",
            style: {
                position: "relative"
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$zoom$2d$pan$2d$pinch$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TransformWrapper"], {
                onPanningStop: handlePan,
                onZoomStop: handleZoom,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$zoom$2d$pan$2d$pinch$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TransformComponent"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        onClick: handleClick,
                        className: "w-full h-full cursor-crosshair relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                ref: mapImgRef,
                                className: "MapPicture w-full h-full select-none",
                                src: "/uw campus map.png",
                                alt: "Campus Map",
                                draggable: false,
                                style: {
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                    pointerEvents: "auto"
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/Map.tsx",
                                lineNumber: 172,
                                columnNumber: 15
                            }, this),
                            props.xCoor != null && props.yCoor != null && props.xRightCoor != null && props.yRightCoor != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: lineStyle()
                            }, void 0, false, {
                                fileName: "[project]/components/Map.tsx",
                                lineNumber: 213,
                                columnNumber: 19
                            }, this),
                            props.xCoor != null && props.yCoor != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    top: "".concat(props.yCoor * 100, "%"),
                                    left: "".concat(props.xCoor * 100, "%"),
                                    position: "absolute",
                                    width: "3px",
                                    height: "3px",
                                    borderRadius: "50%",
                                    backgroundColor: "red",
                                    pointerEvents: "none",
                                    transform: "translate(-50%, -50%)"
                                },
                                className: "z-10"
                            }, void 0, false, {
                                fileName: "[project]/components/Map.tsx",
                                lineNumber: 216,
                                columnNumber: 17
                            }, this),
                            props.xRightCoor != null && props.yRightCoor != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    top: "".concat(props.yRightCoor * 100, "%"),
                                    left: "".concat(props.xRightCoor * 100, "%"),
                                    position: "absolute",
                                    width: "3px",
                                    height: "3px",
                                    borderRadius: "50%",
                                    backgroundColor: "limegreen",
                                    pointerEvents: "none",
                                    transform: "translate(-50%, -50%)"
                                },
                                className: "z-10"
                            }, void 0, false, {
                                fileName: "[project]/components/Map.tsx",
                                lineNumber: 232,
                                columnNumber: 17
                            }, this),
                            props.children
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Map.tsx",
                        lineNumber: 171,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/Map.tsx",
                    lineNumber: 170,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/Map.tsx",
                lineNumber: 169,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/Map.tsx",
            lineNumber: 168,
            columnNumber: 7
        }, this)
    }, void 0, false);
}
_s(Map, "luwob4w49IL/lPvtldQ9EviRIJY=");
_c = Map;
var _c;
__turbopack_context__.k.register(_c, "Map");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/ManualDotPlacer.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>ManualDotPlacer
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$zoom$2d$pan$2d$pinch$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-zoom-pan-pinch/dist/index.esm.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
const campusMapUrl = "/uw campus map.png";
function ManualDotPlacer() {
    _s();
    var _s1 = __turbopack_context__.k.signature();
    const [dots, setDots] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [pendingDot, setPendingDot] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [buildingCode, setBuildingCode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [buildingFloors, setBuildingFloors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ManualDotPlacer.useEffect": ()=>{
            fetch("/api/floorplans").then({
                "ManualDotPlacer.useEffect": (res)=>res.json()
            }["ManualDotPlacer.useEffect"]).then({
                "ManualDotPlacer.useEffect": (data)=>{
                    // Group floorplans by building
                    const floors = {};
                    if (data.floorplans) {
                        data.floorplans.forEach({
                            "ManualDotPlacer.useEffect": (fp)=>{
                                if (!fp.building || fp.building === "UNKNOWN") return;
                                if (!floors[fp.building]) floors[fp.building] = [];
                                floors[fp.building].push({
                                    filename: fp.filename,
                                    floor: fp.floor
                                });
                            }
                        }["ManualDotPlacer.useEffect"]);
                    }
                    setBuildingFloors(floors);
                }
            }["ManualDotPlacer.useEffect"]);
        }
    }["ManualDotPlacer.useEffect"], []);
    // Use right-click (contextmenu) to place dot (attach to parent div)
    function handleMapContextMenu(e) {
        e.preventDefault();
        const img = e.currentTarget.querySelector("img");
        if (!img) return;
        const rect = img.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
            setPendingDot({
                x,
                y
            });
            setBuildingCode("");
        }
    }
    // Save dot with code
    function handleSaveDot() {
        if (!buildingCode.trim() || !pendingDot) return;
        setDots([
            ...dots,
            {
                x: pendingDot.x,
                y: pendingDot.y,
                building: buildingCode.trim()
            }
        ]);
        setPendingDot(null);
        setBuildingCode("");
    }
    // Drag logic
    const dragDotIndex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const dragOffset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    function handleDotMouseDown(e, i) {
        e.stopPropagation();
        dragDotIndex.current = i;
        const rect = e.currentTarget.parentElement.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        dragOffset.current = {
            x: x - dots[i].x,
            y: y - dots[i].y
        };
        document.addEventListener("mousemove", handleDotMouseMove);
        document.addEventListener("mouseup", handleDotMouseUp);
    }
    function handleDotMouseMove(e) {
        if (dragDotIndex.current === null || dragOffset.current === null) return;
        const container = document.getElementById("dot-map-container");
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - dragOffset.current.x;
        const y = (e.clientY - rect.top) / rect.height - dragOffset.current.y;
        setDots((prev)=>prev.map((dot, idx)=>idx === dragDotIndex.current ? {
                    ...dot,
                    x: Math.max(0, Math.min(1, x)),
                    y: Math.max(0, Math.min(1, y))
                } : dot));
    }
    function handleDotMouseUp() {
        dragDotIndex.current = null;
        dragOffset.current = null;
        document.removeEventListener("mousemove", handleDotMouseMove);
        document.removeEventListener("mouseup", handleDotMouseUp);
    }
    function handleDeleteDot(i) {
        setDots((prev)=>prev.filter((_, idx)=>idx !== i));
    }
    // Export JSON
    function handleExport() {
        const json = JSON.stringify(dots, null, 2);
        const blob = new Blob([
            json
        ], {
            type: "application/json"
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "manual_building_lookup.json";
        a.click();
        URL.revokeObjectURL(url);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            width: "100vw",
            height: "100vh",
            background: "#f8f8f8"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: "flex",
                    alignItems: "center",
                    margin: 8
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        style: {
                            margin: 0,
                            marginRight: 16
                        },
                        children: "Manual Building Dot Placer"
                    }, void 0, false, {
                        fileName: "[project]/components/ManualDotPlacer.tsx",
                        lineNumber: 106,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleExport,
                        style: {
                            fontSize: 16,
                            padding: "8px 16px"
                        },
                        children: "Export JSON"
                    }, void 0, false, {
                        fileName: "[project]/components/ManualDotPlacer.tsx",
                        lineNumber: 107,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            marginLeft: 16,
                            color: "#888"
                        },
                        children: [
                            "Dots placed: ",
                            dots.length
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ManualDotPlacer.tsx",
                        lineNumber: 108,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ManualDotPlacer.tsx",
                lineNumber: 105,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                id: "dot-map-container",
                style: {
                    position: "relative",
                    width: "80vw",
                    height: "80vh",
                    margin: "auto"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$zoom$2d$pan$2d$pinch$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TransformWrapper"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$zoom$2d$pan$2d$pinch$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TransformComponent"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                position: "relative",
                                width: "100%",
                                height: "100%"
                            },
                            onContextMenu: handleMapContextMenu,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: campusMapUrl,
                                    alt: "Campus Map",
                                    style: {
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                        display: "block"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/ManualDotPlacer.tsx",
                                    lineNumber: 117,
                                    columnNumber: 15
                                }, this),
                                dots.map(_s1((dot, i)=>{
                                    _s1();
                                    const [hovered, setHovered] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
                                    // Use a wrapper to allow hover state per dot
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            position: "absolute",
                                            top: "".concat(dot.y * 100, "%"),
                                            left: "".concat(dot.x * 100, "%"),
                                            width: 21,
                                            height: 21,
                                            borderRadius: "50%",
                                            background: "yellow",
                                            border: "2px solid #888",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            transform: "translate(-50%, -50%)",
                                            zIndex: 10,
                                            fontWeight: "bold",
                                            color: "#222",
                                            fontSize: 12,
                                            cursor: "grab",
                                            userSelect: "none"
                                        },
                                        title: dot.building,
                                        onMouseDown: (e)=>handleDotMouseDown(e, i),
                                        onMouseEnter: ()=>setHovered(true),
                                        onMouseLeave: ()=>setHovered(false),
                                        children: [
                                            dot.building,
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: (ev)=>{
                                                    ev.stopPropagation();
                                                    handleDeleteDot(i);
                                                },
                                                style: {
                                                    position: "absolute",
                                                    top: -10,
                                                    right: -10,
                                                    width: 18,
                                                    height: 18,
                                                    borderRadius: "50%",
                                                    background: "#f44",
                                                    color: "#fff",
                                                    border: "none",
                                                    fontSize: 12,
                                                    cursor: "pointer",
                                                    zIndex: 20
                                                },
                                                title: "Delete dot",
                                                children: "×"
                                            }, void 0, false, {
                                                fileName: "[project]/components/ManualDotPlacer.tsx",
                                                lineNumber: 155,
                                                columnNumber: 21
                                            }, this),
                                            hovered && buildingFloors[dot.building] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    position: "absolute",
                                                    top: "50%",
                                                    left: "110%",
                                                    transform: "translateY(-50%)",
                                                    background: "#fff",
                                                    border: "1px solid #ccc",
                                                    borderRadius: "6px",
                                                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                                    padding: "6px 12px",
                                                    minWidth: "60px",
                                                    zIndex: 30,
                                                    pointerEvents: "auto",
                                                    whiteSpace: "nowrap"
                                                },
                                                children: buildingFloors[dot.building].map((floorObj)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        style: {
                                                            display: "block",
                                                            width: "100%",
                                                            margin: "2px 0",
                                                            padding: "4px 8px",
                                                            fontSize: "12px",
                                                            background: "#eee",
                                                            border: "1px solid #bbb",
                                                            borderRadius: "4px",
                                                            cursor: "pointer",
                                                            textAlign: "left"
                                                        },
                                                        onClick: ()=>window.open("/clean_floorplans/".concat(floorObj.filename), "_blank"),
                                                        children: floorObj.floor.replace("FLR", "")
                                                    }, floorObj.filename, false, {
                                                        fileName: "[project]/components/ManualDotPlacer.tsx",
                                                        lineNumber: 193,
                                                        columnNumber: 27
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/components/ManualDotPlacer.tsx",
                                                lineNumber: 175,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, i, true, {
                                        fileName: "[project]/components/ManualDotPlacer.tsx",
                                        lineNumber: 127,
                                        columnNumber: 19
                                    }, this);
                                }, "V8YbV+gTZxGliGj1g0fftBlvsq4=")),
                                pendingDot && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        position: "absolute",
                                        top: "".concat(pendingDot.y * 100, "%"),
                                        left: "".concat(pendingDot.x * 100, "%"),
                                        transform: "translate(-50%, -120%)",
                                        zIndex: 20,
                                        background: "#fff",
                                        border: "1px solid #ccc",
                                        borderRadius: 8,
                                        padding: 12,
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                        minWidth: 120
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginBottom: 8
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    children: "Building Code: "
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ManualDotPlacer.tsx",
                                                    lineNumber: 235,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: buildingCode,
                                                    onChange: (e)=>setBuildingCode(e.target.value),
                                                    style: {
                                                        width: 60,
                                                        fontWeight: "bold"
                                                    },
                                                    autoFocus: true
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ManualDotPlacer.tsx",
                                                    lineNumber: 236,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/ManualDotPlacer.tsx",
                                            lineNumber: 234,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleSaveDot,
                                            style: {
                                                marginRight: 8
                                            },
                                            children: "Save"
                                        }, void 0, false, {
                                            fileName: "[project]/components/ManualDotPlacer.tsx",
                                            lineNumber: 244,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setPendingDot(null),
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/components/ManualDotPlacer.tsx",
                                            lineNumber: 245,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/ManualDotPlacer.tsx",
                                    lineNumber: 219,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ManualDotPlacer.tsx",
                            lineNumber: 113,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/ManualDotPlacer.tsx",
                        lineNumber: 112,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/ManualDotPlacer.tsx",
                    lineNumber: 111,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ManualDotPlacer.tsx",
                lineNumber: 110,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ManualDotPlacer.tsx",
        lineNumber: 104,
        columnNumber: 5
    }, this);
}
_s(ManualDotPlacer, "SbdPrsKkUCEnuOjrYLof+eAby50=");
_c = ManualDotPlacer;
var _c;
__turbopack_context__.k.register(_c, "ManualDotPlacer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/LocationUploader.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>LocationUploader
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Map$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Map.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ManualDotPlacer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ManualDotPlacer.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
function LocationUploader() {
    _s();
    // Secret passcode popup logic
    const [showPasscode, setShowPasscode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [passcode, setPasscode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const secretSequence = "qwertyuiop";
    const [typedKeys, setTypedKeys] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    // Get passcode from env (client-side)
    let envPasscode = '';
    if ("TURBOPACK compile-time truthy", 1) {
        // @ts-ignore
        envPasscode = ("TURBOPACK compile-time value", "231");
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LocationUploader.useEffect": ()=>{
            const handleKeyDown = {
                "LocationUploader.useEffect.handleKeyDown": (e)=>{
                    setTypedKeys({
                        "LocationUploader.useEffect.handleKeyDown": (prev)=>{
                            const next = (prev + e.key).slice(-secretSequence.length);
                            if (next === secretSequence) {
                                setShowPasscode(true);
                            }
                            return next;
                        }
                    }["LocationUploader.useEffect.handleKeyDown"]);
                }
            }["LocationUploader.useEffect.handleKeyDown"];
            window.addEventListener("keydown", handleKeyDown);
            return ({
                "LocationUploader.useEffect": ()=>window.removeEventListener("keydown", handleKeyDown)
            })["LocationUploader.useEffect"];
        }
    }["LocationUploader.useEffect"], []);
    const [imageFile, setImageFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [previewUrl, setPreviewUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [xCoor, setXCoor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [yCoor, setYCoor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [uploading, setUploading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [success, setSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [toast, setToast] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LocationUploader.useEffect": ()=>{
            if (success) {
                setToast(success);
                const timer = setTimeout({
                    "LocationUploader.useEffect.timer": ()=>setToast(null)
                }["LocationUploader.useEffect.timer"], 2500);
                return ({
                    "LocationUploader.useEffect": ()=>clearTimeout(timer)
                })["LocationUploader.useEffect"];
            }
            if (error) {
                setToast(error);
                const timer = setTimeout({
                    "LocationUploader.useEffect.timer": ()=>setToast(null)
                }["LocationUploader.useEffect.timer"], 2500);
                return ({
                    "LocationUploader.useEffect": ()=>clearTimeout(timer)
                })["LocationUploader.useEffect"];
            }
        }
    }["LocationUploader.useEffect"], [
        success,
        error
    ]);
    const [name, setName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [building, setBuilding] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [latitude, setLatitude] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [longitude, setLongitude] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const handleFileChange = (e)=>{
        var _e_target_files;
        const file = ((_e_target_files = e.target.files) === null || _e_target_files === void 0 ? void 0 : _e_target_files[0]) || null;
        setImageFile(file);
        setSuccess(null);
        setError(null);
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }
    };
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (!imageFile || xCoor == null || yCoor == null || !building) {
            setError("Please fill all fields, select an image, and location on the map.");
            return;
        }
        setUploading(true);
        setError(null);
        setSuccess(null);
        try {
            const formData = new FormData();
            formData.append("image", imageFile);
            formData.append("xCoordinate", String(xCoor));
            formData.append("yCoordinate", String(yCoor));
            formData.append("name", name);
            formData.append("building", building);
            formData.append("latitude", latitude);
            formData.append("longitude", longitude);
            // Determine status based on passcode
            let status = "needs approval";
            let devToast = false;
            if (showPasscode && passcode === envPasscode) {
                status = "approved";
                devToast = true;
            }
            formData.append("status", status);
            const res = await fetch("api/uploadLocation", {
                method: "POST",
                body: formData
            });
            if (res.ok) {
                setSuccess("Location uploaded successfully!");
                if (devToast) {
                    setToast("Welcome devs!");
                    setTimeout(()=>setToast(null), 2500);
                }
                setImageFile(null);
                setPreviewUrl(null);
                setXCoor(null);
                setYCoor(null);
                setName("");
                setBuilding("");
                setLatitude("");
                setLongitude("");
                setPasscode("");
                setShowPasscode(false);
            } else {
                setError("Upload failed.");
            }
        } catch (err) {
            setError("Error uploading location.");
        }
        setUploading(false);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4",
        children: [
            showPasscode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-lg shadow-lg p-8 flex flex-col items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-xl font-bold mb-4",
                            children: "Enter Passcode"
                        }, void 0, false, {
                            fileName: "[project]/components/LocationUploader.tsx",
                            lineNumber: 132,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "password",
                            value: passcode,
                            onChange: (e)=>setPasscode(e.target.value),
                            className: "border rounded px-4 py-2 mb-4 text-lg",
                            autoFocus: true
                        }, void 0, false, {
                            fileName: "[project]/components/LocationUploader.tsx",
                            lineNumber: 133,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700",
                                    onClick: ()=>setShowPasscode(false),
                                    children: "Close"
                                }, void 0, false, {
                                    fileName: "[project]/components/LocationUploader.tsx",
                                    lineNumber: 141,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700",
                                    onClick: ()=>{
                                        if (passcode === envPasscode) {
                                            setToast("Welcome devs!");
                                            setTimeout(()=>setToast(null), 2500);
                                            setShowPasscode(false);
                                        } else {
                                            setToast("Incorrect passcode");
                                            setTimeout(()=>setToast(null), 2500);
                                        }
                                    },
                                    children: "Submit"
                                }, void 0, false, {
                                    fileName: "[project]/components/LocationUploader.tsx",
                                    lineNumber: 147,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LocationUploader.tsx",
                            lineNumber: 140,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/LocationUploader.tsx",
                    lineNumber: 131,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/LocationUploader.tsx",
                lineNumber: 130,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                className: "w-full max-w-lg bg-white rounded-lg shadow-md p-6 flex flex-col gap-4",
                onSubmit: handleSubmit,
                children: [
                    toast && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed top-6 right-6 z-50 px-6 py-3 rounded-lg shadow font-bold text-white ".concat(toast === success ? 'bg-green-600' : 'bg-red-600'),
                        children: toast
                    }, void 0, false, {
                        fileName: "[project]/components/LocationUploader.tsx",
                        lineNumber: 168,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-bold mb-2 text-gray-800",
                        children: "Upload Campus Location"
                    }, void 0, false, {
                        fileName: "[project]/components/LocationUploader.tsx",
                        lineNumber: 171,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block font-medium text-gray-700",
                        children: "Image File"
                    }, void 0, false, {
                        fileName: "[project]/components/LocationUploader.tsx",
                        lineNumber: 172,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "file",
                        accept: "image/*",
                        onChange: handleFileChange,
                        className: "mb-2"
                    }, void 0, false, {
                        fileName: "[project]/components/LocationUploader.tsx",
                        lineNumber: 173,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block font-medium text-gray-700",
                        children: "Building"
                    }, void 0, false, {
                        fileName: "[project]/components/LocationUploader.tsx",
                        lineNumber: 174,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        value: building,
                        onChange: (e)=>setBuilding(e.target.value),
                        required: true,
                        className: "border rounded px-3 py-2 mb-2"
                    }, void 0, false, {
                        fileName: "[project]/components/LocationUploader.tsx",
                        lineNumber: 175,
                        columnNumber: 9
                    }, this),
                    previewUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: previewUrl,
                        alt: "Preview",
                        className: "max-w-xs rounded shadow mb-2"
                    }, void 0, false, {
                        fileName: "[project]/components/LocationUploader.tsx",
                        lineNumber: 177,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-center w-full",
                        style: {
                            width: "100%",
                            margin: 0,
                            padding: 0
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                width: "90vw",
                                maxWidth: 1200,
                                aspectRatio: "896/683",
                                position: "relative",
                                background: "#eaeaea",
                                borderRadius: 12,
                                overflow: "hidden",
                                margin: 0,
                                padding: 0
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Map$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                xCoor: xCoor,
                                yCoor: yCoor,
                                setXCoor: setXCoor,
                                setYCoor: setYCoor,
                                xRightCoor: null,
                                yRightCoor: null,
                                aspectRatio: 0.25
                            }, void 0, false, {
                                fileName: "[project]/components/LocationUploader.tsx",
                                lineNumber: 181,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/LocationUploader.tsx",
                            lineNumber: 180,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/LocationUploader.tsx",
                        lineNumber: 179,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "submit",
                        disabled: uploading,
                        className: "px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 disabled:opacity-50",
                        children: uploading ? "Uploading..." : "Submit Location"
                    }, void 0, false, {
                        fileName: "[project]/components/LocationUploader.tsx",
                        lineNumber: 195,
                        columnNumber: 9
                    }, this),
                    success && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-green-600 font-semibold",
                        children: success
                    }, void 0, false, {
                        fileName: "[project]/components/LocationUploader.tsx",
                        lineNumber: 198,
                        columnNumber: 21
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-red-600 font-semibold",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/components/LocationUploader.tsx",
                        lineNumber: 199,
                        columnNumber: 19
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/LocationUploader.tsx",
                lineNumber: 166,
                columnNumber: 7
            }, this),
            passcode === envPasscode && !showPasscode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    width: "100%",
                    maxWidth: 1000,
                    margin: "32px auto 0 auto"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ManualDotPlacer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/components/LocationUploader.tsx",
                    lineNumber: 204,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/LocationUploader.tsx",
                lineNumber: 203,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/LocationUploader.tsx",
        lineNumber: 127,
        columnNumber: 5
    }, this);
}
_s(LocationUploader, "daV2SWUZ9GQa99h0Il18bmQUqDw=");
_c = LocationUploader;
var _c;
__turbopack_context__.k.register(_c, "LocationUploader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/GamePage.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>GamePage
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Map$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Map.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LocationUploader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/LocationUploader.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function GamePage() {
    _s();
    const [showUploader, setShowUploader] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [transformReady, setTransformReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [totalPoints, setTotalPoints] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [imageIDs, setImageIDs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [questionCount, setQuestionCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [setupDone, setSetupDone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [xCoor, setXCoor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [yCoor, setYCoor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [xRightCoor, setXRightCoor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [yRightCoor, setYRightCoor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [imgOpacity, setImgOpacity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0.8);
    const hovering = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const requestingImage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    function requestImage() {
        if (requestingImage.current) return;
        requestingImage.current = true;
        fetch("/api/getPhoto", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                mode: "no-cors"
            },
            body: JSON.stringify({
                previousCodes: imageIDs
            })
        }).then((res)=>res.json()).then((json)=>{
            if (imageIDs.includes(json.id)) {
                setImageIDs([
                    json.id
                ]);
            } else {
                setImageIDs([
                    ...imageIDs,
                    json.id
                ]);
            }
            setState(json);
            setXCoor(null);
            setYCoor(null);
            setXRightCoor(null);
            setYRightCoor(null);
            requestingImage.current = false;
        });
    }
    const validatingCoordinate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const mapContainerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    function zoomToGuessAndAnswer() {
        const parent = mapContainerRef.current;
        if (!parent || xCoor == null || yCoor == null || xRightCoor == null || yRightCoor == null) return;
        const parentWidth = parent.clientWidth;
        const parentHeight = parent.clientHeight;
        let topleftX = (Math.min(xCoor, xRightCoor) - 0.05) * parentWidth;
        let topleftY = (Math.min(yCoor, yRightCoor) - 0.05) * parentHeight;
        const bottomrightX = (Math.max(xCoor, xRightCoor) + 0.05) * parentWidth;
        const bottomrightY = (Math.max(yCoor, yRightCoor) + 0.05) * parentHeight;
        const scaleX = (bottomrightX - topleftX) / parentWidth;
        const scaleY = (bottomrightY - topleftY) / parentHeight;
        const scale = 1 / Math.max(scaleX, scaleY);
        // Center the viewport
        if (scaleX > scaleY) {
            topleftY = (topleftY + bottomrightY) / 2 - parentHeight / scale / 2;
        } else {
            topleftX = (topleftX + bottomrightX) / 2 - parentWidth / scale / 2;
        }
        // Scroll the parent div to the calculated position
        parent.scrollTo({
            left: Math.max(0, -topleftX * scale),
            top: Math.max(0, -topleftY * scale),
            behavior: "smooth"
        });
    }
    function validateCoordinate() {
        if (validatingCoordinate.current) return;
        validatingCoordinate.current = true;
        fetch("/api/validateCoordinate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                xCoor: xCoor,
                yCoor: yCoor,
                id: state.id
            })
        }).then((res)=>res.json()).then((json)=>{
            setXRightCoor(json.xCoor);
            setYRightCoor(json.yCoor);
            setTotalPoints(totalPoints + json.points);
            setQuestionCount(questionCount + 1);
            validatingCoordinate.current = false;
            // Zoom and pan to show both dots
            zoomToGuessAndAnswer();
        });
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GamePage.useEffect": ()=>{
            if (setupDone) return;
            setSetupDone(true);
            requestImage();
        }
    }["GamePage.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 flex items-center justify-center bg-gray-50 overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "absolute top-4 right-4 z-50 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700",
                onClick: ()=>setShowUploader((v)=>!v),
                children: showUploader ? "Back to Game" : "Add Location"
            }, void 0, false, {
                fileName: "[project]/components/GamePage.tsx",
                lineNumber: 127,
                columnNumber: 7
            }, this),
            showUploader ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LocationUploader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/components/GamePage.tsx",
                lineNumber: 134,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative flex flex-col items-center justify-center w-full h-full",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-4 left-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-xl font-bold text-gray-800 bg-white/80 rounded px-4 py-2 shadow",
                            children: [
                                "Points: ",
                                totalPoints
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/GamePage.tsx",
                            lineNumber: 138,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/GamePage.tsx",
                        lineNumber: 137,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-4 right-4 z-50",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700",
                            onClick: ()=>setShowUploader((v)=>!v),
                            children: showUploader ? "Back to Game" : "Add Location"
                        }, void 0, false, {
                            fileName: "[project]/components/GamePage.tsx",
                            lineNumber: 143,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/GamePage.tsx",
                        lineNumber: 142,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-center w-full h-full",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            ref: mapContainerRef,
                            className: "flex items-center justify-center w-full h-full max-w-4xl max-h-[80vh] mx-auto my-auto bg-white rounded shadow-lg overflow-hidden relative",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Map$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    xCoor: xCoor,
                                    yCoor: yCoor,
                                    setXCoor: xRightCoor == null && yRightCoor == null ? setXCoor : ()=>{},
                                    setYCoor: xRightCoor == null && yRightCoor == null ? setYCoor : ()=>{},
                                    xRightCoor: xRightCoor,
                                    yRightCoor: yRightCoor,
                                    disabled: xRightCoor != null && yRightCoor != null,
                                    aspectRatio: 0.7 * (896 / 683)
                                }, void 0, false, {
                                    fileName: "[project]/components/GamePage.tsx",
                                    lineNumber: 155,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute top-4 right-4 z-50",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700",
                                        onClick: ()=>{
                                            return xRightCoor == null || yRightCoor == null ? validateCoordinate() : requestImage();
                                        },
                                        children: xRightCoor == null || yRightCoor == null ? "Submit" : "Next"
                                    }, void 0, false, {
                                        fileName: "[project]/components/GamePage.tsx",
                                        lineNumber: 170,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/GamePage.tsx",
                                    lineNumber: 169,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/GamePage.tsx",
                            lineNumber: 151,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/GamePage.tsx",
                        lineNumber: 150,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute bottom-4 left-4 flex justify-start items-start w-full",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            className: "rounded shadow opacity-80 hover:opacity-100 transition duration-200 hover:scale-120 origin-bottom-left",
                            src: state.image,
                            style: {
                                maxWidth: 400,
                                marginRight: 20,
                                zIndex: 99999
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/GamePage.tsx",
                            lineNumber: 184,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/GamePage.tsx",
                        lineNumber: 183,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/GamePage.tsx",
                lineNumber: 136,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/GamePage.tsx",
        lineNumber: 126,
        columnNumber: 5
    }, this);
}
_s(GamePage, "MphF6W8RfaCRKiKLcYBqGEAFIAk=");
_c = GamePage;
var _c;
__turbopack_context__.k.register(_c, "GamePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>Home
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$GamePage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/GamePage.tsx [app-client] (ecmascript)");
"use client";
;
;
function Home() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$GamePage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=_4a29ec98._.js.map