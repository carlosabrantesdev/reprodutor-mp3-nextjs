"use client";
import React, { useEffect, useRef, useState } from "react";

export default function MP3Player() {
  const [playlist, setPlaylist] = useState<{ url: string; name: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [coverUrl, setCoverUrl] = useState<string>("https://i.ibb.co/s9SDYs3M/image.png");
  const [title, setTitle] = useState<string>("Reprodutor MP3");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.5);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playBarRef = useRef<HTMLDivElement | null>(null);

  const playImg = "https://i.ibb.co/bTTsKBc/play-1.png";
  const pauseImg = "https://i.ibb.co/Yz8j2WM/pause.png";
  const prevImg = "https://i.ibb.co/cc6ghPWH/play-2.png";
  const nextImg = "https://i.ibb.co/Mk4ZYpXq/play.png";

  const volumeUpImg = "https://i.ibb.co/DHNVB44d/483365.png";
  const volumeDownImg = "https://i.ibb.co/0pGTxxcp/aaaa.png";

  async function updateCoverFromSongName(songName: string) {
    try {
      const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(songName)}&entity=song&limit=1`);
      const data = await response.json();
      if (data.results?.length > 0) {
        const artwork = data.results[0].artworkUrl100.replace("100x100", "300x300");
        setCoverUrl(artwork);
      } else {
        setCoverUrl("https://i.ibb.co/s9SDYs3M/image.png");
      }
    } catch {
      setCoverUrl("https://i.ibb.co/s9SDYs3M/image.png");
    }
  }

  useEffect(() => {
    if (playlist.length === 0) return;
    const track = playlist[currentIndex];
    const nameWithoutExt = track.name.replace(/\.[^/.]+$/, "");
    setTitle(nameWithoutExt.length > 30 ? nameWithoutExt.slice(0, 30) + "..." : nameWithoutExt);
    updateCoverFromSongName(nameWithoutExt);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.load();
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentIndex, playlist]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const percent = (audio.currentTime / audio.duration) * 100;
    setProgress(percent);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPlaylist = files.map((file) => ({ url: URL.createObjectURL(file), name: file.name }));
    setPlaylist(newPlaylist);
    if (newPlaylist.length > 0) setCurrentIndex(0);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !playlist.length) return;
    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration || !playBarRef.current) return;
    const rect = playBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * audio.duration;
  };

  const nextTrack = () => {
    if (!playlist.length) return;
    setCurrentIndex((curr) => (curr + 1) % playlist.length);
  };

  const prevTrack = () => {
    if (!playlist.length) return;
    setCurrentIndex((curr) => (curr - 1 + playlist.length) % playlist.length);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    audioRef.current.muted = newMutedState;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    const handleEnded = () => nextTrack();
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [playlist, currentIndex, volume]);

  return (
    <section className="h-[100vh] w-[100vw] flex justify-center items-center bg-black overflow-hidden relative">
      <div className="absolute inset-0 w-full h-full bg-cover bg-center blur-md" style={{ backgroundImage: `url(${coverUrl})`, zIndex: 0 }}></div>

      <div className="flex flex-col items-center bg-white h-[670px] w-[425px] rounded-[16px] shadow-md gap-[16px] relative z-10 p-6 scale-90">
        <h1 className="text-[24px] font-bold text-center text-black truncate w-[360px] h-[80px]">{title}</h1>

        <img src={coverUrl} alt="cover" className="w-[350px] h-auto rounded-[8px] shadow-md" />

        <div ref={playBarRef} onClick={handleBarClick} className="w-[360px] h-[8px] bg-gray-300 rounded-[8px] cursor-pointer relative">
          <div className="absolute top-0 left-0 h-full bg-black rounded-[8px]" style={{ width: `${progress}%` }} />
          <div className="absolute top-1/2" style={{ left: `calc(${progress}% )`, transform: "translate(-50%, -50%)", width: "18px", height: "18px", background: "white", border: "3px solid black", borderRadius: "50%", boxShadow: "0 0 8px rgba(0,0,0,0.3)", pointerEvents: "none" }} />
        </div>

        <div className="flex flex-col items-center gap-[12px]">
          <div className="flex justify-between w-[160px] items-center">
            <button onClick={prevTrack}><img src={prevImg} alt="previous" className="w-[28px] h-[28px] hover:scale-110 transition-transform" /></button>
            <button onClick={togglePlay}><img src={isPlaying ? pauseImg : playImg} alt="play" className="w-[56px] h-[56px] hover:scale-110 transition-transform" /></button>
            <button onClick={nextTrack}><img src={nextImg} alt="next" className="w-[28px] h-[28px] hover:scale-110 transition-transform" /></button>
          </div>

          <div className="flex items-center gap-[8px] w-[240px]">
            <button onClick={toggleMute}>
              <img
                src={isMuted ? volumeDownImg : volumeUpImg}
                alt="mute toggle"
                className="w-[32px] hover:scale-110 transition-transform"
              />
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-[6px] bg-gray-300 rounded-lg appearance-none cursor-pointer accent-black"
            />
          </div>
        </div>

        <audio ref={audioRef} className="hidden" onTimeUpdate={handleTimeUpdate} />

        <div className="flex justify-center items-center w-[240px] h-[40px]">
          <label htmlFor="mp3Input" className="flex justify-center items-center w-full h-full bg-gradient-to-br from-white to-gray-100 text-black text-[18px] font-bold rounded-[8px] shadow hover:scale-105 active:scale-95 transition-transform cursor-pointer">
            Adicionar músicas
          </label>
          <input id="mp3Input" type="file" accept="audio/mpeg" multiple hidden onChange={handleFileChange} />
        </div>
      </div>
    </section>
  );
}
