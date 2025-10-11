"use client";
import React, { useEffect, useRef, useState } from "react";

export default function MP3Player() {
  // Hooks de estado (UseState)
  const [playlist, setPlaylist] = useState<{ url: string; name: string }[]>([]); // Playlist de músicas
  const [currentIndex, setCurrentIndex] = useState<number>(0); // Índice da música atual
  const [coverUrl, setCoverUrl] = useState<string>("https://i.ibb.co/s9SDYs3M/image.png"); // URL da capa padrão
  const [title, setTitle] = useState<string>("Reprodutor MP3"); // Título da música
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // Estado de reprodução
  const [progress, setProgress] = useState<number>(0); // Progresso da música na barra de porcentagem
  const [volume, setVolume] = useState<number>(0.5); // Volume do áudio

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playBarRef = useRef<HTMLDivElement | null>(null);

  // URLs das imagens dos botões de play/pause/next/prev
  const playImg = "https://i.ibb.co/bTTsKBc/play-1.png";
  const pauseImg = "https://i.ibb.co/Yz8j2WM/pause.png";
  const prevImg = "https://i.ibb.co/cc6ghPWH/play-2.png";
  const nextImg = "https://i.ibb.co/Mk4ZYpXq/play.png";

  async function updateCoverFromSongName(songName: string) {
    try {
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(songName)}&entity=song&limit=1`
      );
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

  // Carregar a música atual
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
    const newPlaylist = files.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
    }));
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

  // Atualizar volume e ir para a próxima faixa quando a música terminar.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    const handleEnded = () => nextTrack();
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [playlist, currentIndex, volume]);

return (
  <section
    className="h-[100vh] w-[100vw] flex justify-center items-center bg-black overflow-hidden relative"
  >
    <div
      className="absolute inset-0 w-full h-full bg-cover bg-center blur-md"
      style={{ backgroundImage: `url(${coverUrl})`, zIndex: 0 }}
    ></div>

    <div className="flex flex-col items-center bg-white h-[918px] w-[594px] rounded-[22px] shadow-md gap-[32px] relative z-10 p-8 scale-90">
      <h1 className="text-[38px] font-bold text-center text-black truncate w-[540px] h-[162px]">
        {title}
      </h1>

      <img src={coverUrl} alt="cover" className="w-[490px] h-auto rounded-[11px] shadow-md" />

      <div
        ref={playBarRef}
        onClick={handleBarClick}
        className="w-[540px] h-[11px] bg-gray-300 rounded-[11px] cursor-pointer relative"
      >
        <div
          className="absolute top-0 left-0 h-full bg-black rounded-[11px]"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-1/2"
          style={{
            left: `calc(${progress}% )`,
            transform: "translate(-50%, -50%)",
            width: "29px",
            height: "29px",
            background: "white",
            border: "5px solid black",
            borderRadius: "50%",
            boxShadow: "0 0 22px rgba(0,0,0,0.3)",
            pointerEvents: "none",
          }}
        />
      </div>

      <div className="flex flex-col items-center gap-[22px]">
        <div className="flex justify-between w-[216px] items-center">
          <button onClick={prevTrack}>
            <img
              src={prevImg}
              alt="previous"
              className="w-[43px] h-[43px] hover:scale-110 transition-transform"
            />
          </button>
          <button onClick={togglePlay}>
            <img
              src={isPlaying ? pauseImg : playImg}
              alt="play"
              className="w-[86px] h-[86px] hover:scale-110 transition-transform"
            />
          </button>
          <button onClick={nextTrack}>
            <img
              src={nextImg}
              alt="next"
              className="w-[43px] h-[43px] hover:scale-110 transition-transform"
            />
          </button>
        </div>

        <div className="flex items-center gap-[11px] w-[324px]">
          <span className="text-black text-[22px]">
            <img src="https://i.ibb.co/0pGTxxcp/aaaa.png" alt="" className="w-[54px]" />
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-[9px] bg-gray-300 rounded-lg appearance-none cursor-pointer accent-black"
          />
          <span className="text-black text-[22px]">
            <img src="https://i.ibb.co/DHNVB44d/483365.png" alt="" className="w-[54px]" />
          </span>
        </div>
      </div>

      <audio
        ref={audioRef}
        className="hidden"
        onTimeUpdate={handleTimeUpdate}
      />

      <div className="flex justify-center items-center w-[324px] h-[162px]">
        <label
          htmlFor="mp3Input"
          className="flex justify-center items-center w-full h-full bg-gradient-to-br from-white to-gray-100 text-black text-[27px] font-bold rounded-[11px] shadow hover:scale-105 active:scale-92 transition-transform cursor-pointer"
        >
          Adicionar músicas
        </label>
        <input
          id="mp3Input"
          type="file"
          accept="audio/mpeg"
          multiple
          hidden
          onChange={handleFileChange}
        />
      </div>
    </div>
  </section>
);
}