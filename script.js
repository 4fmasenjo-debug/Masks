const video = document.getElementById("video");
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
  faceapi.nets.ageGenderNet.loadFromUri("./models")
])
  .then(() => {
    console.log("Modelos cargados correctamente");
  })
  .catch((err) => {
    console.error("Error cargando modelos:", err);
  });

// ============================================================
// IMÁGENES DE LAS MÁSCARAS SEGÚN LA EMOCIÓN
// ============================================================

const emotionImageMap = {
  happy: "./emociones máscaras/alegría.png",
  sad: "./emociones máscaras/tristeza.png",
  angry: "./emociones máscaras/ira.png",
  neutral: "./emociones máscaras/neutral.png",
  surprised: "./emociones máscaras/sorpresa.png",
  disgusted: "./emociones máscaras/asco.png",
  fearful: "./emociones máscaras/miedo.png"
};

const activeMaskElements = new Map();
video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  canvas.style.position = "absolute";
  canvas.style.left = "0";
  canvas.style.top = "0";
  canvas.style.zIndex = "5";
  canvas.style.pointerEvents = "none";
  document.body.append(canvas);
  const displaySize = {
    width: video.videoWidth || video.width,
    height: video.videoHeight || video.height
  };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    if (
      video.readyState < 2 ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      return;
    }
    try {
      const detections = await faceapi
        .detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();
      const resizedDetections = faceapi.resizeResults(
        detections,
        displaySize
      );
      const ctx = canvas.getContext("2d");
      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
      const currentFaceIndices = new Set();
      resizedDetections.forEach((detection, index) => {
        currentFaceIndices.add(index);
        const expressions = detection.expressions;
        const sortedExpressions = Object.keys(expressions).sort(
          (a, b) => expressions[b] - expressions[a]
        );
        const dominantEmotion = sortedExpressions[0];
        const imagePath =
          emotionImageMap[dominantEmotion];
        let maskElement =
          activeMaskElements.get(index);
        if (!maskElement) {
          maskElement =
            document.createElement("img");
          maskElement.className =
            "emotion-mask";
          maskElement.style.position =
            "absolute";
          maskElement.style.zIndex =
            "10";
          maskElement.style.height =
            "auto";
          maskElement.style.pointerEvents =
            "none";
          document.body.appendChild(
            maskElement
          );
          activeMaskElements.set(
            index,
            maskElement
          );
        }
        if (
          !maskElement.src.endsWith(
            imagePath
          )
        ) {
          maskElement.src =
            imagePath;
        }
        maskElement.style.display =
          "block";
        const box =
          detection.detection.box;
        const videoRect =
          video.getBoundingClientRect();
        const scaleFactor =
          1.15;
        const offsetX =
          (box.width *
            (scaleFactor - 1.1)) /
          2;
        const offsetY =
          box.height * -0.23;
        maskElement.style.width =
          `${box.width * scaleFactor}px`;
        maskElement.style.left =
          `${videoRect.left +
            box.x -
            offsetX}px`;
        maskElement.style.top =
          `${videoRect.top +
            box.y +
            offsetY}px`;
      });
      activeMaskElements.forEach(
        (maskElement, index) => {
          if (
            !currentFaceIndices.has(index)
          ) {
            maskElement.remove();
            activeMaskElements.delete(
              index
            );
          }
        }
      );
      // ========================================================
      // TEXTO: EDAD + GÉNERO + EMOCIÓN
      // ========================================================

      resizedDetections.forEach(
        (detection) => {
          const age =
            Math.round(
              detection.age
            );
          const gender =
            detection.gender === "male"
              ? "Masculino"
              : "Femenino";
          const expressions =
            detection.expressions;
          const sortedExpressions =
            Object.keys(
              expressions
            ).sort(
              (a, b) =>
                expressions[b] -
                expressions[a]
            );
          const dominantEmotion =
            sortedExpressions[0];
          let emotionText =
            dominantEmotion;
          switch (
            dominantEmotion
          ) {
            case "happy":
              emotionText =
                "Alegría";
              break;
            case "sad":
              emotionText =
                "Tristeza";
              break;
            case "angry":
              emotionText =
                "Enojo";
              break;
            case "neutral":
              emotionText =
                "Neutral";
              break;
            case "surprised":
              emotionText =
                "Sorpresa";
              break;
            case "disgusted":
              emotionText =
                "Asco";
              break;
            case "fearful":
              emotionText =
                "Miedo";
              break;
          }
          const textToShow =
            `Edad: ${age} - Género: ${gender} - ${emotionText}`;
          ctx.font =
            "20px Arial";
          ctx.fillStyle =
            "white";
          ctx.textAlign =
            "center";
          ctx.shadowColor =
            "black";
          ctx.shadowBlur =
            5;
          const textX =
            detection.detection.box.x +
            (
              detection.detection.box.width /
              2
            );
          const textY =
            detection.detection.box.y -
            40;
          ctx.fillText(
            textToShow,
            textX,
            textY
          );
          ctx.shadowBlur =
            0;
        }
      );
    } catch (error) {
      console.error(
        "Error durante la detección:",
        error
      );
    }
  }, 100);
});
