"use client";

import { useEffect, useRef, useState } from "react";
import {
  COMMUNITY_AUDIO_ACCEPT,
  COMMUNITY_AUDIO_CHECKLIST,
  COMMUNITY_AUDIO_MAX_BYTES,
  buildCommunityAudioIssueBody,
  precheckCommunityAudio,
  suggestedCommunityAudioFileName,
  type CommunityAudioChecklistId,
} from "@/lib/audio/community-audio";

type CommunityAudioUploaderProps = {
  issuesUrl: string;
  defaultEntry?: string;
  defaultWord?: string;
  defaultEnglish?: string;
};

type ChecklistState = Record<CommunityAudioChecklistId, boolean>;

function emptyChecklist(): ChecklistState {
  return COMMUNITY_AUDIO_CHECKLIST.reduce((acc, item) => {
    acc[item.id] = false;
    return acc;
  }, {} as ChecklistState);
}

async function readDurationSeconds(file: Blob): Promise<number | null> {
  const url = URL.createObjectURL(file);
  try {
    const duration = await new Promise<number | null>((resolve) => {
      const audio = new Audio();
      audio.preload = "metadata";
      audio.onloadedmetadata = () => {
        resolve(
          Number.isFinite(audio.duration) && audio.duration > 0
            ? audio.duration
            : null,
        );
      };
      audio.onerror = () => resolve(null);
      audio.src = url;
    });
    return duration;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function CommunityAudioUploader({
  issuesUrl,
  defaultEntry = "",
  defaultWord = "",
  defaultEnglish = "",
}: CommunityAudioUploaderProps) {
  const [entrySlug, setEntrySlug] = useState(defaultEntry);
  const [kweyolWord, setKweyolWord] = useState(defaultWord);
  const [englishTranslation, setEnglishTranslation] = useState(defaultEnglish);
  const [regionNote, setRegionNote] = useState("");
  const [submitterNote, setSubmitterNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);
  const [listened, setListened] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistState>(emptyChecklist);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [localApiAvailable, setLocalApiAvailable] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    let cancelled = false;
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    void fetch(`${base}/api/submissions/audio`, { method: "GET" })
      .then((response) => {
        if (!cancelled) setLocalApiAvailable(response.ok);
      })
      .catch(() => {
        if (!cancelled) setLocalApiAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function applyFile(next: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(next);
    setListened(false);
    setDurationSeconds(null);
    setErrors([]);
    setStatus(null);
    if (!next) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(next);
    setPreviewUrl(url);
    const duration = await readDurationSeconds(next);
    setDurationSeconds(duration);
  }

  async function startRecording() {
    setStatus(null);
    setErrors([]);
    if (!navigator.mediaDevices?.getUserMedia) {
      setErrors(["This browser cannot record audio. Choose a file instead."]);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        const recorded = new File(
          [blob],
          suggestedCommunityAudioFileName(entrySlug || "recording", blob.type),
          { type: blob.type },
        );
        void applyFile(recorded);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setErrors(["Could not access the microphone. Check permissions or upload a file."]);
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  function runPrecheck() {
    return precheckCommunityAudio({
      fileName: file?.name ?? "",
      mimeType: file?.type ?? "",
      byteLength: file?.size ?? 0,
      durationSeconds,
      listened,
      checklist,
      entrySlug,
      kweyolWord,
    });
  }

  function downloadRecording(target: File) {
    const name = suggestedCommunityAudioFileName(
      entrySlug || "recording",
      target.type,
    );
    const url = URL.createObjectURL(target);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(url);
    return name;
  }

  function openIssue(fileName: string) {
    const title = encodeURIComponent(`[AUDIO] ${kweyolWord || entrySlug}`);
    const body = encodeURIComponent(
      buildCommunityAudioIssueBody({
        entrySlug,
        kweyolWord,
        englishTranslation,
        fileName,
        mimeType: file?.type ?? "",
        byteLength: file?.size ?? 0,
        durationSeconds,
        regionNote,
        submitterNote,
      }),
    );
    const separator = issuesUrl.includes("?") ? "&" : "?";
    window.open(
      `${issuesUrl}${separator}title=${title}&body=${body}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function submitLocalApi(target: File) {
    const form = new FormData();
    form.set("entrySlug", entrySlug);
    form.set("kweyolWord", kweyolWord);
    form.set("englishTranslation", englishTranslation);
    form.set("regionNote", regionNote);
    form.set("submitterNote", submitterNote);
    form.set("durationSeconds", String(durationSeconds ?? ""));
    form.set("checklist", JSON.stringify(checklist));
    form.set("listened", String(listened));
    form.set("audio", target, target.name);

    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const response = await fetch(`${base}/api/submissions/audio`, {
      method: "POST",
      body: form,
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        errors?: string[];
      } | null;
      throw new Error(
        payload?.errors?.join(" ") ||
          payload?.error ||
          "Local audio submission failed.",
      );
    }
  }

  async function handleSubmit() {
    const result = runPrecheck();
    if (!result.ok || !file) {
      setErrors(result.errors);
      return;
    }

    try {
      if (localApiAvailable) {
        await submitLocalApi(file);
        setStatus(
          "Submitted to local review queue. An editor must accept it before it replaces practice TTS.",
        );
        return;
      }

      const downloadedName = downloadRecording(file);
      openIssue(downloadedName);
      setStatus(
        "Downloaded your recording and opened a GitHub Issue. Attach that file to the issue, then submit. Editors will re-listen before publication.",
      );
    } catch (error) {
      setErrors([
        error instanceof Error ? error.message : "Could not submit audio.",
      ]);
    }
  }

  return (
    <section className="community-audio" aria-labelledby="community-audio-title">
      <h2 id="community-audio-title" className="section-title">
        Contribute verified speech
      </h2>
      <p className="section-lead">
        Record or upload Dominican Kwéyòl pronunciation. The site pre-checks your
        file and requires you to listen first. Editors then re-test meticulously
        before any clip replaces synthetic practice audio.
      </p>

      <div className="admin-form">
        <label>
          Entry slug
          <input
            value={entrySlug}
            onChange={(event) => setEntrySlug(event.target.value)}
            placeholder="bonjou"
            required
          />
        </label>
        <label>
          Kwéyòl word
          <input
            value={kweyolWord}
            onChange={(event) => setKweyolWord(event.target.value)}
            placeholder="bonjou"
            required
          />
        </label>
        <label>
          English (optional)
          <input
            value={englishTranslation}
            onChange={(event) => setEnglishTranslation(event.target.value)}
            placeholder="good morning"
          />
        </label>
        <label>
          Region / speaker note (optional)
          <input
            value={regionNote}
            onChange={(event) => setRegionNote(event.target.value)}
            placeholder="e.g. Roseau speaker, adult"
          />
        </label>

        <div className="community-audio__capture">
          <button
            type="button"
            className="btn btn--soft btn--md"
            onClick={() => (recording ? stopRecording() : void startRecording())}
          >
            {recording ? "Stop recording" : "Record with microphone"}
          </button>
          <label className="community-audio__file">
            Or choose audio file
            <input
              type="file"
              accept={`${COMMUNITY_AUDIO_ACCEPT.join(",")},.mp3,.wav,.webm,.ogg,.m4a,.aac`}
              onChange={(event) => {
                const next = event.target.files?.[0] ?? null;
                if (next && next.size > COMMUNITY_AUDIO_MAX_BYTES) {
                  setErrors(["Keep the recording under 5 MB."]);
                  return;
                }
                void applyFile(next);
              }}
            />
          </label>
        </div>

        {previewUrl ? (
          <div className="community-audio__preview">
            <p>
              Preview {file?.name}{" "}
              {durationSeconds != null
                ? `(${durationSeconds.toFixed(1)}s)`
                : "(duration unknown)"}
            </p>
            <audio
              controls
              src={previewUrl}
              onPlay={() => setListened(true)}
              onEnded={() => setListened(true)}
            />
            <p className="community-audio__hint">
              You must press play and listen before the submit button unlocks.
            </p>
          </div>
        ) : null}

        <fieldset className="community-audio__checklist">
          <legend>Pre-verification checklist</legend>
          {COMMUNITY_AUDIO_CHECKLIST.map((item) => (
            <label key={item.id} className="community-audio__check">
              <input
                type="checkbox"
                checked={checklist[item.id]}
                onChange={(event) =>
                  setChecklist((current) => ({
                    ...current,
                    [item.id]: event.target.checked,
                  }))
                }
              />
              <span>{item.label}</span>
            </label>
          ))}
        </fieldset>

        <label>
          Note for editors (optional)
          <textarea
            rows={3}
            value={submitterNote}
            onChange={(event) => setSubmitterNote(event.target.value)}
          />
        </label>

        {errors.length ? (
          <ul className="community-audio__errors">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        ) : null}
        {status ? <p className="community-audio__status">{status}</p> : null}

        <button
          type="button"
          className="btn btn--primary btn--md"
          onClick={() => void handleSubmit()}
        >
          {localApiAvailable
            ? "Submit for local review"
            : "Download recording & open review issue"}
        </button>
        <p className="community-audio__hint">
          {localApiAvailable
            ? "Local API detected: file goes to the review queue, not straight onto the public site."
            : "On GitHub Pages, your browser downloads the file and opens a moderated GitHub Issue. Attach the file there. Nothing goes live until editors accept it."}
        </p>
      </div>
    </section>
  );
}
