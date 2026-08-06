import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Layers, Maximize2, RefreshCw, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';

export interface OutbreakPoint {
  id: number | string;
  region: string;
  diseaseType: string;
  caseCount: number;
  severity: string;
  latitude: number;
  longitude: number;
  reportedDate?: string;
  status?: string;
}

export interface SosPoint {
  id: number | string;
  description: string;
  latitude: number;
  longitude: number;
  createdAt?: string;
  status?: string;
}

interface InteractiveMapProps {
  points: OutbreakPoint[];
  sosPoints?: SosPoint[];
  selectedPointId?: number | string | null;
  onSelectPoint?: (point: OutbreakPoint) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

export default function InteractiveMap({
  points,
  sosPoints = [],
  selectedPointId,
  onSelectPoint,
  height = "550px",
  center = [20.5937, 78.9629], // Default center of India
  zoom = 5,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapLayer, setMapLayer] = React.useState<'dark' | 'satellite' | 'street'>('dark');
  const [filterSeverity, setFilterSeverity] = React.useState<string>('all');

  // Tile layer URL helper
  const getTileUrl = (type: 'dark' | 'satellite' | 'street') => {
    switch (type) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'street':
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      case 'dark':
      default:
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    }
  };

  const getAttribution = (type: 'dark' | 'satellite' | 'street') => {
    switch (type) {
      case 'satellite':
        return 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
      case 'street':
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
      case 'dark':
      default:
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: false,
        attributionControl: true,
      });

      const tileLayer = L.tileLayer(getTileUrl('dark'), {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: getAttribution('dark'),
      }).addTo(map);

      // Custom zoom control in top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      tileLayerRef.current = tileLayer;
      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    // Auto resize handling
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Update Tile Layer when layer style changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newTileLayer = L.tileLayer(getTileUrl(mapLayer), {
      maxZoom: 19,
      subdomains: mapLayer === 'dark' ? 'abcd' : 'a',
      attribution: getAttribution(mapLayer),
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTileLayer;
  }, [mapLayer]);

  // Render Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    // Filter points based on severity if selected
    const filteredPoints = filterSeverity === 'all' 
      ? points 
      : points.filter(p => p.severity?.toLowerCase() === filterSeverity.toLowerCase());

    filteredPoints.forEach((point) => {
      if (typeof point.latitude !== 'number' || typeof point.longitude !== 'number') return;
      if (isNaN(point.latitude) || isNaN(point.longitude)) return;

      const isSelected = selectedPointId !== null && selectedPointId !== undefined && String(selectedPointId) === String(point.id);
      const sev = (point.severity || 'low').toLowerCase();

      let color = '#10b981'; // Emerald default
      let bgPulse = 'rgba(16, 185, 129, 0.4)';
      let size = 28;

      if (sev === 'critical') {
        color = '#ef4444';
        bgPulse = 'rgba(239, 68, 68, 0.6)';
        size = 36;
      } else if (sev === 'high') {
        color = '#f59e0b';
        bgPulse = 'rgba(245, 158, 11, 0.5)';
        size = 32;
      } else if (sev === 'medium') {
        color = '#eab308';
        bgPulse = 'rgba(234, 179, 8, 0.5)';
        size = 30;
      }

      if (isSelected) {
        size += 8;
      }

      // Draw highlighted containment border circle around Critical and High severity regions
      if (sev === 'critical') {
        const containmentZone = L.circle([point.latitude, point.longitude], {
          radius: isSelected ? 65000 : 50000, // 50km containment radius
          color: '#ef4444',
          weight: isSelected ? 4 : 3,
          opacity: 0.95,
          fillColor: '#ef4444',
          fillOpacity: isSelected ? 0.35 : 0.2,
          dashArray: '8, 8',
          className: 'critical-containment-ring',
        });

        containmentZone.bindTooltip(`
          <div style="font-family: system-ui, sans-serif; font-size: 11px; font-weight: 800; color: #ef4444; text-transform: uppercase; letter-spacing: 0.05em; background: #0f172a; padding: 4px 8px; border-radius: 6px; border: 2px solid #ef4444;">
            🚨 CRITICAL CONTAINMENT BORDER: ${point.region}
          </div>
        `, { permanent: isSelected, direction: 'top', className: 'containment-tooltip' });

        containmentZone.on('click', () => {
          if (onSelectPoint) onSelectPoint(point);
        });

        markersGroup.addLayer(containmentZone);
      } else if (sev === 'high') {
        const highRiskZone = L.circle([point.latitude, point.longitude], {
          radius: isSelected ? 45000 : 35000,
          color: '#f59e0b',
          weight: isSelected ? 3 : 2,
          opacity: 0.85,
          fillColor: '#f59e0b',
          fillOpacity: isSelected ? 0.25 : 0.12,
          dashArray: '6, 6',
        });

        highRiskZone.bindTooltip(`
          <div style="font-family: system-ui, sans-serif; font-size: 10px; font-weight: 700; color: #f59e0b; background: #0f172a; padding: 3px 6px; border-radius: 4px; border: 1px solid #f59e0b;">
            ⚠️ HIGH RISK BUFFER: ${point.region}
          </div>
        `, { permanent: isSelected, direction: 'top' });

        highRiskZone.on('click', () => {
          if (onSelectPoint) onSelectPoint(point);
        });

        markersGroup.addLayer(highRiskZone);
      }

      // Create glowing HTML Marker
      const customIcon = L.divIcon({
        className: 'custom-outbreak-marker',
        html: `
          <div style="
            position: relative;
            width: ${size}px;
            height: ${size}px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <div style="
              position: absolute;
              inset: 0;
              border-radius: 50%;
              background-color: ${bgPulse};
              animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              position: relative;
              width: ${size - 10}px;
              height: ${size - 10}px;
              border-radius: 50%;
              background-color: ${color};
              border: ${sev === 'critical' ? '3px solid #ffffff' : '2px solid #ffffff'};
              box-shadow: 0 0 ${sev === 'critical' ? '20px' : '12px'} ${color};
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-weight: bold;
              font-size: 11px;
            ">
              ${point.caseCount}
            </div>
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([point.latitude, point.longitude], { icon: customIcon });

      // Popup Content
      const popupHtml = `
        <div style="padding: 10px; min-width: 230px; font-family: system-ui, sans-serif;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              padding: 2px 8px;
              border-radius: 9999px;
              background-color: ${bgPulse};
              color: ${color};
              border: 2px solid ${color};
            ">${point.severity.toUpperCase()} ZONE</span>
            <span style="font-size: 11px; font-weight: 600; color: #cbd5e1;">${point.region}</span>
          </div>
          <h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #ffffff;">${point.diseaseType}</h4>
          <div style="
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 8px;
            padding: 8px;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
          ">
            <div>
              <span style="font-size: 10px; color: #94a3b8; display: block; font-weight: 500;">Confirmed Cases</span>
              <strong style="font-size: 16px; color: #ffffff;">${point.caseCount}</strong>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 10px; color: #94a3b8; display: block; font-weight: 500;">Perimeter</span>
              <strong style="font-size: 12px; color: ${color};">${sev === 'critical' ? '50km Sealed' : '35km Monitored'}</strong>
            </div>
          </div>
          <div style="font-size: 10px; color: #64748b; text-align: right;">
            Lat: ${point.latitude.toFixed(4)}, Lng: ${point.longitude.toFixed(4)}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: true,
        className: 'dark-leaflet-popup',
      });

      marker.on('click', () => {
        if (onSelectPoint) {
          onSelectPoint(point);
        }
      });

      markersGroup.addLayer(marker);
    });

    // Render SOS points if provided
    sosPoints.forEach((sos) => {
      if (typeof sos.latitude !== 'number' || typeof sos.longitude !== 'number') return;
      if (isNaN(sos.latitude) || isNaN(sos.longitude)) return;

      const sosIcon = L.divIcon({
        className: 'custom-sos-marker',
        html: `
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              position: absolute;
              inset: -4px;
              border-radius: 50%;
              background-color: rgba(220, 38, 38, 0.7);
              animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              position: relative;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background-color: #dc2626;
              border: 2px solid #ffffff;
              box-shadow: 0 0 15px #dc2626;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
            ">
              🚨
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const sosMarker = L.marker([sos.latitude, sos.longitude], { icon: sosIcon });
      sosMarker.bindPopup(`
        <div style="padding: 8px; min-width: 200px; color: #ffffff;">
          <div style="display: inline-block; background: #dc2626; color: white; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; margin-bottom: 6px;">EMERGENCY SOS</div>
          <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 600;">${sos.description}</p>
          <span style="font-size: 10px; color: #94a3b8;">Location: ${sos.latitude.toFixed(4)}, ${sos.longitude.toFixed(4)}</span>
        </div>
      `);

      markersGroup.addLayer(sosMarker);
    });

  }, [points, sosPoints, selectedPointId, filterSeverity]);

  // Fly to selected point when selectedPointId changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedPointId) return;

    const target = points.find(p => String(p.id) === String(selectedPointId));
    if (target && typeof target.latitude === 'number' && typeof target.longitude === 'number') {
      mapInstanceRef.current.flyTo([target.latitude, target.longitude], 9, {
        duration: 1.5,
      });
    }
  }, [selectedPointId, points]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(center, zoom, { duration: 1.2 });
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden glass-panel border-2 border-primary/40 shadow-2xl shadow-primary/5 ring-1 ring-white/10" style={{ height }}>
      {/* Top Map Control Bar */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap items-center gap-2 bg-slate-950/90 backdrop-blur-md p-2 rounded-xl border-2 border-slate-700/80 shadow-xl">
        {/* Layer selector */}
        <div className="flex items-center gap-1 bg-slate-900/90 rounded-lg p-1 border border-slate-700/60">
          <button
            onClick={() => setMapLayer('dark')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${mapLayer === 'dark' ? 'bg-primary text-primary-foreground shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
          >
            Dark Vector
          </button>
          <button
            onClick={() => setMapLayer('satellite')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${mapLayer === 'satellite' ? 'bg-primary text-primary-foreground shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapLayer('street')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${mapLayer === 'street' ? 'bg-primary text-primary-foreground shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
          >
            Street Map
          </button>
        </div>

        {/* Severity filter */}
        <div className="flex items-center gap-1 bg-slate-900/90 rounded-lg p-1 border border-slate-700/60">
          {['all', 'critical', 'high', 'medium'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md capitalize transition-all ${filterSeverity === sev ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
            >
              {sev}
            </button>
          ))}
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleResetView}
          className="h-8 text-xs font-medium text-slate-200 border-slate-700 bg-slate-900/80 hover:bg-slate-800 hover:text-white px-3"
          title="Reset View to National Overview"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1 text-primary" /> Reset View
        </Button>
      </div>

      {/* Practical Map Legend (Top Right) */}
      <div className="absolute top-4 right-14 z-[400] bg-slate-950/90 backdrop-blur-md px-3 py-2 rounded-xl border-2 border-slate-700/80 shadow-xl hidden md:flex items-center gap-3 text-xs">
        <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider">Legend:</span>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
          <span className="text-slate-200">Critical</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-slate-200">High</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="text-slate-200">Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-slate-200">Low</span>
        </div>
      </div>

      {/* Map Stats Floating Badge */}
      <div className="absolute bottom-4 left-4 z-[400] bg-slate-950/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border-2 border-slate-700/80 shadow-xl flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
          <span className="text-slate-200 font-semibold">{points.filter(p => p.severity?.toLowerCase() === 'critical').length} Critical Outbreaks</span>
        </div>
        <div className="flex items-center gap-2 border-l border-slate-700/80 pl-3">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-slate-200 font-semibold">{points.filter(p => p.severity?.toLowerCase() === 'high').length} High Risk</span>
        </div>
        <div className="flex items-center gap-2 border-l border-slate-700/80 pl-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-200 font-semibold">{points.length} Active Nodes</span>
        </div>
        {sosPoints.length > 0 && (
          <div className="flex items-center gap-1.5 text-red-400 font-bold border-l border-slate-700/80 pl-3">
            🚨 {sosPoints.length} Emergency SOS Signals
          </div>
        )}
      </div>

      {/* Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
