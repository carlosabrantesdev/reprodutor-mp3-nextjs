  "use client";
  import React, { useEffect, useRef, useState } from "react";

  export default function MP3Player() {
    const [playlist, setPlaylist] = useState<{ url: string; name: string }[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [coverUrl, setCoverUrl] = useState<string>("https://i.ibb.co/s9SDYs3M/image.png");
    const [title, setTitle] = useState<string>("Reprodutor MP3");
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
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
    const skipForwardImg = "https://i.ibb.co/B58h2tSn/skip-10-seconds-icon.png";
    const skipBackImg = "https://i.ibb.co/jXSbF9R/past-skip-10-seconds-icon.png";

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
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration);
      const percent = (audio.currentTime / audio.duration) * 100;
      setProgress(percent);
    };

    const formatTime = (seconds: number) => {
      if (isNaN(seconds)) return "0:00";
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const newSongs = files.map((file) => ({ url: URL.createObjectURL(file), name: file.name }));
      setPlaylist((prev) => [...prev, ...newSongs]);
      if (playlist.length === 0 && newSongs.length > 0) setCurrentIndex(0);
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

    const skipTime = (seconds: number) => {
      if (!audioRef.current) return;
      audioRef.current.currentTime = Math.min(
        Math.max(audioRef.current.currentTime + seconds, 0),
        duration
      );
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
      <section className="h-[100vh] w-[100vw] flex justify-center items-center bg-black overflow-hidden relative px-2">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center blur-md"
          style={{ backgroundImage: `url(${coverUrl})`, zIndex: 0 }}
        ></div>

        <div className="flex flex-wrap justify-center gap-4 items-start relative z-10 max-w-[900px]">
          {/* Player principal */}
          <div className="flex flex-col items-center bg-gray-200/50 backdrop-blur-md h-[600px] w-[360px] rounded-[16px] shadow-md gap-[12px] p-4">
            <h1 className="text-[20px] font-bold text-center text-black truncate w-[300px] h-[60px]">
              {title}
            </h1>

            <img
              src={coverUrl}
              alt="cover"
              className="w-[280px] h-auto rounded-[8px] shadow-md"
            />

            <div
              ref={playBarRef}
              onClick={handleBarClick}
              className="w-[300px] h-[6px] bg-gray-300 rounded-[8px] cursor-pointer relative"
            >
              <div
                className="absolute top-0 left-0 h-full bg-black rounded-[8px]"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2"
                style={{
                  left: `calc(${progress}% )`,
                  transform: "translate(-50%, -50%)",
                  width: "14px",
                  height: "14px",
                  background: "white",
                  border: "2px solid black",
                  borderRadius: "50%",
                  pointerEvents: "none",
                }}
              />
            </div>

            <div className="flex justify-between w-[300px] text-sm text-gray-600">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            <div className="flex flex-col items-center gap-[8px]">
              {/* Controles principais */}
              <div className="flex justify-between w-[240px] items-center">
                <button onClick={prevTrack}>
                  <img src={prevImg} alt="previous" className="w-[24px] h-[24px] hover:scale-110 transition-transform" />
                </button>

                <button onClick={() => skipTime(-10)}>
                  <img src={skipBackImg} alt="rewind 10s" className="w-[37px] h-[37px] hover:scale-110 transition-transform" />
                </button>

                <button onClick={togglePlay}>
                  <img src={isPlaying ? pauseImg : playImg} alt="play/pause" className="w-[48px] h-[48px] hover:scale-110 transition-transform" />
                </button>

                <button onClick={() => skipTime(10)}>
                  <img src={skipForwardImg} alt="forward 10s" className="w-[37px] h-[37px] hover:scale-110 transition-transform" />
                </button>

                <button onClick={nextTrack}>
                  <img src={nextImg} alt="next" className="w-[24px] h-[24px] hover:scale-110 transition-transform" />
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-[6px] w-[200px] mt-2">
                <button onClick={toggleMute}>
                  <img
                    src={isMuted ? volumeDownImg : volumeUpImg}
                    alt="mute toggle"
                    className="w-[28px] hover:scale-110 transition-transform"
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

            {/* Botão sempre visível */}
            <div className="flex justify-center items-center w-[200px] h-[36px] mt-3">
              <label
                htmlFor="mp3Input"
                className="flex justify-center items-center w-full h-full opacity-70 bg-gradient-to-br from-white to-gray-100 text-black text-[16px] font-bold rounded-[8px] shadow hover:scale-105 active:scale-95 transition-transform cursor-pointer"
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

          {/* Lista de músicas */}
          {playlist.length > 0 && (
            <div className="bg-gray-200/50 h-[600px] w-[220px] rounded-[16px] shadow-md overflow-y-auto p-3 backdrop-blur-md scrollbar-thin scrollbar-thumb-gray-400/30 scrollbar-track-transparent">
              <h2 className="text-[16px] font-bold mb-2 text-center">
                Lista de músicas
              </h2>
              <ul className="flex flex-col gap-1">
                {playlist.map((track, index) => (
                  <li
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`cursor-pointer px-2 py-1 rounded hover:bg-gray-100 hover:opacity-70 ${
                      index === currentIndex ? "bg-gray-200 font-bold" : ""
                    }`}
                  >
                    {track.name.replace(/\.[^/.]+$/, "")}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <audio ref={audioRef} className="hidden" onTimeUpdate={handleTimeUpdate} />
      </section>
    );
  }
