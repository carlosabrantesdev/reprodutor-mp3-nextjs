"use client";
import React, { useEffect, useRef, useState } from "react";

export default function MP3Player() {
  const [playlist, setPlaylist] = useState<{ url: string; name: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [coverUrl, setCoverUrl] = useState<string>("https://i.ibb.co/s9SDYs3M/image.png");
  const [title, setTitle] = useState<string>("MP3 Player");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playBarRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => nextTrack();
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [playlist, currentIndex]);

  return (
    <section
      className="h-[100vh] w-[100vw] flex justify-center items-center bg-black bg-cover bg-center transition-all duration-700"
      style={{ backgroundImage: `url(${coverUrl})` }}
    >
      <div className="flex flex-col justify-between items-center bg-white h-[85vh] w-[55vh] p-[3vh] rounded-[2vh] shadow-md gap-[3vh] relative z-10">
        <h1 className="text-[3.5vh] font-bold text-center text-black truncate w-[50vh] h-[15vh]">
          {title}
        </h1>
        <img src={coverUrl} alt="cover" className="w-[50vh] h-auto rounded-[1vh] shadow-md" />
        <div
          ref={playBarRef}
          onClick={handleBarClick}
          className="w-[50vh] h-[1vh] bg-gray-300 rounded-[1vh] cursor-pointer relative"
        >
          <div
            className="absolute top-0 left-0 h-full bg-black rounded-[1vh]"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2"
            style={{
              left: `calc(${progress}% )`,
              transform: "translate(-50%, -50%)",
              width: "2.7vh",
              height: "2.7vh",
              background: "white",
              border: "0.5vh solid black",
              borderRadius: "50%",
              boxShadow: "0 0 2vh rgba(0,0,0,0.3)",
              pointerEvents: "none",
            }}
          />
        </div>
        <div className="flex justify-between w-[20vh] items-center">
          <button onClick={prevTrack}>
            <img src={prevImg} alt="previous" className="w-[4vh] h-[4vh] hover:scale-110 transition-transform" />
          </button>
          <button onClick={togglePlay}>
            <img
              src={isPlaying ? pauseImg : playImg}
              alt="play"
              className="w-[8vh] h-[8vh] hover:scale-110 transition-transform"
            />
          </button>
          <button onClick={nextTrack}>
            <img src={nextImg} alt="next" className="w-[4vh] h-[4vh] hover:scale-110 transition-transform" />
          </button>
        </div>
        <audio
          ref={audioRef}
          className="hidden"
          onTimeUpdate={handleTimeUpdate}
        />
        <div className="flex justify-center items-center w-[30vh] h-[15vh]">
          <label
            htmlFor="mp3Input"
            className="flex justify-center items-center w-full h-full bg-gradient-to-br from-white to-gray-100 text-black text-[2.5vh] font-bold rounded-[1vh] shadow hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            Adicionar músicas
          </label>
          <input id="mp3Input" type="file" accept="audio/mpeg" multiple hidden onChange={handleFileChange} />
        </div>
      </div>
    </section>
  );
}
