interface HeaderStats {
    total: number;
    chesscom: number;
    lichess: number;
    chesscomUsername?: string;
    lichessUsername?: string;
    year: string;
}

interface YearHeatmap {
    year: string;
    svgString: string;
}

function dataURLToBlob(dataURL: string): Blob {
    const parts = dataURL.split(',');
    const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;

    link.style.visibility = 'hidden';
    link.style.position = 'absolute';

    document.body.appendChild(link);

    link.click();

    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}

async function renderHeatmapToBlob(svgString: string, stats: HeaderStats): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            reject(new Error("Canvas context not available"));
            return;
        }

        const img = new Image();
        const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            const heatmapWidth = img.naturalWidth || 750;
            const heatmapHeight = img.naturalHeight || 120;

            const padding = 40;
            const headerHeight = 160;

            canvas.width = Math.max(heatmapWidth + (padding * 2), 900);
            canvas.height = heatmapHeight + headerHeight + (padding * 2);

            ctx.fillStyle = "#0d1117";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#e6edf3";
            ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif";
            ctx.fillText(`Chess Heatmap — ${stats.year}`, padding, padding + 30);

            let yPos = padding + 70;
            const drawBadge = (label: string, user: string, color: string) => {
                ctx.font = "16px sans-serif";
                ctx.fillStyle = "#8b949e";
                ctx.fillText(label, padding, yPos);
                const labelW = ctx.measureText(label).width;
                ctx.fillStyle = color;
                ctx.fillText(user, padding + labelW + 8, yPos);
                yPos += 28;
            };

            if (stats.chesscomUsername && stats.lichessUsername) {
                drawBadge("Chess.com:", stats.chesscomUsername, "#58a6ff");
                drawBadge("Lichess:", stats.lichessUsername, "#ffffff");
            } else if (stats.chesscomUsername) {
                drawBadge("Chess.com:", stats.chesscomUsername, "#58a6ff");
            } else if (stats.lichessUsername) {
                drawBadge("Lichess:", stats.lichessUsername, "#ffffff");
            }

            const rightX = canvas.width - padding;
            let statY = padding + 30;
            ctx.textAlign = "right";

            ctx.font = "14px sans-serif";
            ctx.fillStyle = "#8b949e";
            ctx.fillText("Total Games", rightX, statY);

            statY += 35;
            ctx.font = "bold 36px sans-serif";
            ctx.fillStyle = "#3fb950";
            ctx.fillText(stats.total.toLocaleString(), rightX, statY);

            statY += 40;
            ctx.font = "14px sans-serif";
            ctx.fillStyle = "#8b949e";

            if (stats.chesscom > 0) {
                ctx.fillText(`Chess.com: ${stats.chesscom.toLocaleString()}`, rightX, statY);
                statY += 22;
            }
            if (stats.lichess > 0) {
                ctx.fillText(`Lichess: ${stats.lichess.toLocaleString()}`, rightX, statY);
            }

            ctx.textAlign = "left";

            ctx.strokeStyle = "#30363d";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding, padding + headerHeight - 20);
            ctx.lineTo(canvas.width - padding, padding + headerHeight - 20);
            ctx.stroke();

            const xOffset = Math.max(padding, (canvas.width - heatmapWidth) / 2);
            ctx.drawImage(img, xOffset, padding + headerHeight);

            ctx.textAlign = "right";
            ctx.fillStyle = "rgba(139, 148, 158, 0.5)";
            ctx.font = "12px sans-serif";
            ctx.fillText("chessheat.royceps.com", canvas.width - padding, canvas.height - 15);

            URL.revokeObjectURL(url);

            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error("Failed to create PNG blob"));
                }
            }, "image/png", 1.0);
        };

        img.onerror = (e) => {
            URL.revokeObjectURL(url);
            reject(e);
        };
        img.src = url;
    });
}

async function renderMultiYearToBlob(years: YearHeatmap[], stats: HeaderStats): Promise<Blob> {
    return new Promise(async (resolve, reject) => {
        try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject(new Error("Canvas context not available"));
                return;
            }

            const padding = 40;
            const headerHeight = 160;
            const yearLabelHeight = 40;
            const heatmapPadding = 20;

            const loadedImages: { img: HTMLImageElement; year: string }[] = [];

            for (const { year, svgString } of years) {
                const img = await new Promise<HTMLImageElement>((res, rej) => {
                    const image = new Image();
                    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    image.onload = () => {
                        URL.revokeObjectURL(url);
                        res(image);
                    };
                    image.onerror = (e) => {
                        URL.revokeObjectURL(url);
                        rej(e);
                    };
                    image.src = url;
                });
                loadedImages.push({ img, year });
            }

            const maxWidth = Math.max(...loadedImages.map(i => i.img.naturalWidth || 750));
            const totalHeatmapHeight = loadedImages.reduce(
                (acc, i) => acc + (i.img.naturalHeight || 120) + yearLabelHeight + heatmapPadding,
                0
            );

            canvas.width = Math.max(maxWidth + (padding * 2), 900);
            canvas.height = headerHeight + totalHeatmapHeight + (padding * 2);

            ctx.fillStyle = "#0d1117";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#e6edf3";
            ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif";
            ctx.fillText(`Chess Heatmap — All Years`, padding, padding + 30);

            let yPos = padding + 70;
            const drawBadge = (label: string, user: string, color: string) => {
                ctx.font = "16px sans-serif";
                ctx.fillStyle = "#8b949e";
                ctx.fillText(label, padding, yPos);
                const labelW = ctx.measureText(label).width;
                ctx.fillStyle = color;
                ctx.fillText(user, padding + labelW + 8, yPos);
                yPos += 28;
            };

            if (stats.chesscomUsername && stats.lichessUsername) {
                drawBadge("Chess.com:", stats.chesscomUsername, "#58a6ff");
                drawBadge("Lichess:", stats.lichessUsername, "#ffffff");
            } else if (stats.chesscomUsername) {
                drawBadge("Chess.com:", stats.chesscomUsername, "#58a6ff");
            } else if (stats.lichessUsername) {
                drawBadge("Lichess:", stats.lichessUsername, "#ffffff");
            }

            const rightX = canvas.width - padding;
            let statY = padding + 30;
            ctx.textAlign = "right";

            ctx.font = "14px sans-serif";
            ctx.fillStyle = "#8b949e";
            ctx.fillText("Total Games", rightX, statY);

            statY += 35;
            ctx.font = "bold 36px sans-serif";
            ctx.fillStyle = "#3fb950";
            ctx.fillText(stats.total.toLocaleString(), rightX, statY);

            statY += 40;
            ctx.font = "14px sans-serif";
            ctx.fillStyle = "#8b949e";
            if (stats.chesscom > 0) {
                ctx.fillText(`Chess.com: ${stats.chesscom.toLocaleString()}`, rightX, statY);
                statY += 22;
            }
            if (stats.lichess > 0) {
                ctx.fillText(`Lichess: ${stats.lichess.toLocaleString()}`, rightX, statY);
            }
            ctx.textAlign = "left";

            ctx.strokeStyle = "#30363d";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding, padding + headerHeight - 20);
            ctx.lineTo(canvas.width - padding, padding + headerHeight - 20);
            ctx.stroke();

            let currentY = padding + headerHeight;
            for (const { img, year } of loadedImages) {
                ctx.fillStyle = "#e6edf3";
                ctx.font = "bold 20px sans-serif";
                ctx.fillText(year, padding, currentY + 25);
                currentY += yearLabelHeight;

                const xOffset = Math.max(padding, (canvas.width - img.naturalWidth) / 2);
                ctx.drawImage(img, xOffset, currentY);
                currentY += (img.naturalHeight || 120) + heatmapPadding;
            }

            ctx.textAlign = "right";
            ctx.fillStyle = "rgba(139, 148, 158, 0.5)";
            ctx.font = "12px sans-serif";
            ctx.fillText("chessheat.royceps.com", canvas.width - padding, canvas.height - 15);

            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error("Failed to create PNG blob"));
                }
            }, "image/png", 1.0);
        } catch (e) {
            reject(e);
        }
    });
}


export async function downloadPNG(svgString: string, filename: string, stats: HeaderStats) {
    try {
        const blob = await renderHeatmapToBlob(svgString, stats);
        triggerDownload(blob, filename);
    } catch (e) {
        console.error("Failed to download PNG:", e);
        throw e;
    }
}

export async function downloadPNGMultiYear(
    years: YearHeatmap[],
    filename: string,
    stats: HeaderStats
) {
    try {
        const blob = await renderMultiYearToBlob(years, stats);
        triggerDownload(blob, filename);
    } catch (e) {
        console.error("Failed to download multi-year PNG:", e);
        throw e;
    }
}

export function downloadSVG(svgString: string, filename: string) {
    const brandingText = `<text x="100%" y="100%" dx="-10" dy="-10" fill="#8b949e" opacity="0.5" font-size="12" font-family="sans-serif" text-anchor="end">chessheat.royceps.com</text>`;
    const modifiedSvg = svgString.replace('</svg>', `${brandingText}</svg>`);

    const blob = new Blob([modifiedSvg], { type: "image/svg+xml;charset=utf-8" });
    triggerDownload(blob, filename);
}

export function generateEmbedCode(
    chesscomUsername: string | undefined,
    lichessUsername: string | undefined,
    year: string,
    type: 'iframe' | 'markdown' | 'html' | 'url'
) {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://chessheat.royceps.com';

    const params = new URLSearchParams();
    if (chesscomUsername) params.set("chesscom", chesscomUsername);
    if (lichessUsername) params.set("lichess", lichessUsername);
    params.set("year", year);

    const shareUrl = `${baseUrl}/dashboard?${params.toString()}`;

    let pathPart = "";
    if (chesscomUsername && lichessUsername) pathPart = `combined/${chesscomUsername}-${lichessUsername}`;
    else if (chesscomUsername) pathPart = `chesscom/${chesscomUsername}`;
    else if (lichessUsername) pathPart = `lichess/${lichessUsername}`;

    const embedUrl = `https://chessheat-image.royceps.com/api/${pathPart}?year=${year}`;

    switch (type) {
        case 'iframe':
            return `<iframe src="${shareUrl}" width="100%" height="600" frameborder="0"></iframe>`;
        case 'markdown':
            return `[![Chess Heatmap](${embedUrl})](${shareUrl})`;
        case 'html':
            return `<a href="${shareUrl}"><img src="${embedUrl}" alt="Chess Heatmap" /></a>`;
        case 'url':
            return shareUrl;
    }
    return shareUrl;
}
