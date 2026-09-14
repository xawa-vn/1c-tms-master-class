"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { steps } from "@/data/steps";
import qrCode from "@/public/qr-master-class.png";
import {
  ArrowIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  DownloadIcon,
  ExpandIcon,
  MonitorIcon,
  ResetIcon,
} from "./icons";

const TOTAL_MINUTES = 10;

export default function MasterClass() {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [current, setCurrent] = useState(0);
  const [checked, setChecked] = useState<Record<number, number[]>>({});
  const [openImage, setOpenImage] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState("");

  const step = steps[current];
  const completedSteps = useMemo(
    () => steps.filter((item, index) => (checked[index]?.length ?? 0) === item.actions.length).length,
    [checked],
  );
  const currentComplete = (checked[current]?.length ?? 0) === step.actions.length;
  const progress = finished ? 100 : started ? ((current + 1) / steps.length) * 100 : 0;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [started, current, finished]);

  const goNext = useCallback(() => {
    if (!started) {
      setStarted(true);
      return;
    }
    if (current === steps.length - 1) {
      setFinished(true);
      return;
    }
    setCurrent((value) => Math.min(steps.length - 1, value + 1));
  }, [current, started]);

  const goBack = useCallback(() => {
    if (finished) {
      setFinished(false);
      return;
    }
    if (current === 0) {
      setStarted(false);
      return;
    }
    setCurrent((value) => Math.max(0, value - 1));
  }, [current, finished]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, [contenteditable='true']")) return;
      if (openImage) {
        if (event.key === "Escape") setOpenImage(null);
        return;
      }
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goBack, goNext, openImage]);

  const toggleAction = (actionIndex: number) => {
    setChecked((value) => {
      const items = value[current] ?? [];
      const next = items.includes(actionIndex)
        ? items.filter((item) => item !== actionIndex)
        : [...items, actionIndex];
      return { ...value, [current]: next };
    });
  };

  const selectStep = (index: number) => {
    setStarted(true);
    setFinished(false);
    setCurrent(index);
  };

  const restart = () => {
    setCurrent(0);
    setStarted(false);
    setFinished(false);
    setChecked({});
    setParticipantName("");
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={restart} aria-label="На начальный экран">
          <span className="brand-mark">1С</span>
          <span className="brand-copy">
            <strong>Цифровая логистика</strong>
            <small>Мастер-класс · Великий Новгород</small>
          </span>
        </button>

        <span className="event-tag">ЧВТ · Профессионалы</span>
      </header>

      <div className="progress-line" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>

      {!started ? (
        <Welcome onStart={() => setStarted(true)} />
      ) : finished ? (
        <Finish
          completed={completedSteps}
          participantName={participantName}
          onNameChange={setParticipantName}
          onRestart={restart}
          onBack={goBack}
        />
      ) : (
        <div className="workspace">
          <aside className="step-rail" aria-label="Шаги мастер-класса">
            <div className="rail-heading">
              <span>Маршрут занятия</span>
              <strong>{current + 1} / {steps.length}</strong>
            </div>
            <nav>
              {steps.map((item, index) => {
                const done = (checked[index]?.length ?? 0) === item.actions.length;
                return (
                  <button
                    key={item.title}
                    className={`${index === current ? "active" : ""} ${done ? "done" : ""}`}
                    onClick={() => selectStep(index)}
                    aria-current={index === current ? "step" : undefined}
                  >
                    <span className="step-number">{done ? <CheckIcon /> : index + 1}</span>
                    <span><small>{item.duration} мин</small>{item.title}</span>
                  </button>
                );
              })}
            </nav>
            <div className="rail-result">
              <span className="result-icon"><CheckIcon /></span>
              <div><small>Финал</small><strong>Маршрутный лист</strong></div>
            </div>
          </aside>

          <section className="lesson">
            <div className="lesson-head">
              <div>
                <p className="eyebrow">{step.eyebrow}</p>
                <h1>{step.title}</h1>
                <p className="lead">{step.lead}</p>
              </div>
              <span className="duration"><ClockIcon /> ≈ {step.duration} мин</span>
            </div>

            <div className="lesson-grid">
              <div className="main-column">
                <div className={`image-grid images-${step.images.length}`}>
                  {step.images.map((image, index) => (
                    <figure key={image.src} className="screen-card">
                      <button onClick={() => setOpenImage(image.src)} aria-label={`Увеличить изображение ${index + 1}`}>
                        <Image src={image.src} alt={image.alt} width={1400} height={760} priority={current === 0} />
                        <span className="expand"><ExpandIcon /></span>
                      </button>
                      <figcaption><span>{index + 1}</span>{image.caption}</figcaption>
                    </figure>
                  ))}
                </div>

                <section className="checklist-block">
                  <div className="section-title">
                    <div><span className="section-kicker">Выполните по порядку</span><h2>Ваши действия</h2></div>
                    <span>{checked[current]?.length ?? 0} из {step.actions.length}</span>
                  </div>
                  <div className="checklist">
                    {step.actions.map((action, index) => {
                      const isChecked = checked[current]?.includes(index) ?? false;
                      return (
                        <button key={action} className={isChecked ? "checked" : ""} onClick={() => toggleAction(index)}>
                          <span className="check-box">{isChecked && <CheckIcon />}</span>
                          <span>{action}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="why-block">
                  <span>Зачем это нужно</span>
                  <p>{step.reason}</p>
                </section>
              </div>

            </div>

            <footer className="lesson-footer">
              <button className="button secondary" onClick={goBack}><ArrowIcon direction="left" /> Назад</button>
              <span className="key-hint">Используйте клавиши <kbd>←</kbd> <kbd>→</kbd></span>
              <button className="button primary" onClick={goNext}>
                {current === steps.length - 1 ? "Завершить" : currentComplete ? "Готово, дальше" : "Следующий шаг"}
                <ArrowIcon />
              </button>
            </footer>
          </section>
        </div>
      )}

      {openImage && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Увеличенный скриншот" onClick={() => setOpenImage(null)}>
          <button className="lightbox-close" onClick={() => setOpenImage(null)} aria-label="Закрыть"><CloseIcon /></button>
          <Image src={openImage} alt="Увеличенный скриншот интерфейса 1С:TMS" width={1500} height={900} onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </main>
  );
}

function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <section className="welcome">
      <div className="welcome-copy">
        <p className="eyebrow"><span /> Интерактивный мастер-класс</p>
        <h1>Управляем перевозкой<br />в <em>1С:TMS</em></h1>
        <p className="welcome-lead">Создадим рейс, проверим маршрут и подготовим маршрутный лист — от первого клика до готового документа.</p>
        <div className="welcome-meta">
          <span><ClockIcon /><strong>{TOTAL_MINUTES} минут</strong><small>на практику</small></span>
          <span><MonitorIcon /><strong>6 шагов</strong><small>в 1С:TMS</small></span>
          <span><CheckIcon /><strong>1 результат</strong><small>маршрутный лист</small></span>
        </div>
        <div className="welcome-actions">
          <button className="button primary large" onClick={onStart}>
            Начать мастер-класс<ArrowIcon />
          </button>
          <QrCard />
        </div>
      </div>
      <div className="welcome-visual" aria-hidden="true">
        <div className="route-map">
          <div className="route-label route-label-top"><small>Старт</small><strong>Новый рейс</strong></div>
          <div className="route-label route-label-middle"><small>Маршрут</small><strong>4 точки</strong></div>
          <div className="route-label route-label-bottom"><small>Финиш</small><strong>Документ готов</strong></div>
          <svg className="route-canvas" viewBox="0 0 500 600" fill="none">
            <path className="route-path" d="M112 34C386 58 410 191 233 242C47 296 67 437 354 464C439 472 455 523 407 571C442 590 443 548 409 550C454 520 438 484 354 452C68 425 48 302 233 254C409 203 385 70 112 46C82 45 82 20 112 34Z" stroke="currentColor" strokeWidth="3" strokeDasharray="8 11" />
            <g className="route-truck">
              <rect x="-25" y="-15" width="34" height="23" rx="4" fill="#f28c28" />
              <path d="M9-10h12l9 10v8H9z" fill="#151820" />
              <path d="M14-6h6l5 6H14z" fill="#fff" opacity=".9" />
              <rect x="-20" y="-10" width="16" height="3" rx="1.5" fill="#fff" opacity=".55" />
              <circle cx="-14" cy="10" r="5" fill="#151820" stroke="#fff" strokeWidth="2" />
              <circle cx="20" cy="10" r="5" fill="#151820" stroke="#fff" strokeWidth="2" />
              <animateMotion dur="18s" repeatCount="indefinite" rotate="auto" path="M112 34C386 58 410 191 233 242C47 296 67 437 354 464C439 472 455 523 407 571C442 590 443 548 409 550C454 520 438 484 354 452C68 425 48 302 233 254C409 203 385 70 112 46C82 45 82 20 112 34Z" />
            </g>
          </svg>
          <span className="route-dot dot-1" /><span className="route-dot dot-2" /><span className="route-dot dot-3" />
          <div className="cargo-stack">
            <span /><span /><span />
            <small>Груз в пути</small>
          </div>
          <div className="document-preview"><span>1С:TMS</span><div className="paper-lines" /><strong>Маршрутный лист</strong><CheckIcon /></div>
        </div>
      </div>
      <p className="competence">Компетенция «Специалист по контролю качества транспортных логистических процессов»</p>
    </section>
  );
}

function Finish({
  completed,
  participantName,
  onNameChange,
  onRestart,
  onBack,
}: {
  completed: number;
  participantName: string;
  onNameChange: (name: string) => void;
  onRestart: () => void;
  onBack: () => void;
}) {
  const displayName = participantName.trim() || "Имя участника";

  const downloadCard = () => {
    const name = participantName.trim();
    if (!name) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 1000;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#f28c28";
    context.fillRect(0, 0, 34, canvas.height);
    context.fillRect(0, 0, canvas.width, 18);

    context.fillStyle = "#f28c28";
    context.fillRect(112, 92, 92, 92);
    context.fillStyle = "#ffffff";
    context.font = "900 42px Arial, sans-serif";
    context.textAlign = "center";
    context.fillText("1С", 158, 153);

    context.textAlign = "left";
    context.fillStyle = "#111318";
    context.font = "800 28px Arial, sans-serif";
    context.fillText("ЦИФРОВАЯ ЛОГИСТИКА", 232, 125);
    context.fillStyle = "#59616d";
    context.font = "600 20px Arial, sans-serif";
    context.fillText("Мастер-класс · Великий Новгород", 232, 162);

    context.textAlign = "center";
    context.fillStyle = "#b45d0b";
    context.font = "800 22px Arial, sans-serif";
    context.fillText("ПАМЯТНАЯ КАРТОЧКА УЧАСТНИКА", 800, 282);

    let nameSize = 92;
    do {
      context.font = `800 ${nameSize}px Arial, sans-serif`;
      nameSize -= 2;
    } while (context.measureText(name).width > 1320 && nameSize > 48);
    context.fillStyle = "#111318";
    context.fillText(name, 800, 420);

    context.fillStyle = "#59616d";
    context.font = "500 30px Arial, sans-serif";
    context.fillText("выполнил(а) практическое задание", 800, 505);
    context.fillStyle = "#111318";
    context.font = "700 42px Arial, sans-serif";
    context.fillText("«Управление перевозкой в 1С:TMS»", 800, 585);

    context.strokeStyle = "#c8cdd4";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(210, 665);
    context.lineTo(1390, 665);
    context.stroke();

    context.fillStyle = "#f28c28";
    context.beginPath();
    context.arc(800, 738, 38, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#ffffff";
    context.lineWidth = 8;
    context.beginPath();
    context.moveTo(781, 739);
    context.lineTo(796, 754);
    context.lineTo(823, 722);
    context.stroke();

    context.fillStyle = "#111318";
    context.font = "700 24px Arial, sans-serif";
    context.fillText("ЧВТ · Профессионалы", 800, 835);
    context.fillStyle = "#68717d";
    context.font = "500 18px Arial, sans-serif";
    context.fillText("Памятная карточка · не является официальным сертификатом", 800, 925);

    const safeName = name.replace(/[^a-zA-Zа-яА-ЯёЁ0-9]+/g, "-").replace(/^-|-$/g, "");
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `master-class-${safeName || "participant"}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  };

  return (
    <section className="finish">
      <div className="finish-mark"><CheckIcon /></div>
      <p className="eyebrow">Маршрут завершён</p>
      <h1>Рейс оформлен.<br />Маршрутный лист готов.</h1>
      <p className="finish-lead">Вы прошли путь специалиста по контролю качества: связали исполнителей, груз и маршрут в одном документе.</p>
      <div className="result-grid">
        <div><span>01</span><strong>Транспорт и водитель</strong><p>Ответственные за выполнение рейса</p></div>
        <div><span>02</span><strong>Плановое время</strong><p>Выезд, прибытие и возврат</p></div>
        <div><span>03</span><strong>Точки маршрута</strong><p>Адреса, вес, объём и время</p></div>
      </div>
      <p className="completion-count">Чек-листы: <strong>{completed} из {steps.length}</strong></p>
      <section className="memory-card-section">
        <div className="memory-card-form">
          <span className="section-kicker">Памятный результат</span>
          <h2>Ваша именная карточка</h2>
          <p>Введите имя участника — карточку можно показать на телефоне или скачать как PNG.</p>
          <label htmlFor="participant-name">Имя и фамилия</label>
          <input
            id="participant-name"
            value={participantName}
            onChange={(event) => onNameChange(event.target.value.slice(0, 60))}
            placeholder="Например, Иван Петров"
            autoComplete="name"
          />
          <button className="button primary download-button" disabled={!participantName.trim()} onClick={downloadCard}>
            <DownloadIcon /> Скачать PNG
          </button>
          <small>Не является официальным сертификатом.</small>
        </div>
        <div className="memory-card-preview" aria-label="Предпросмотр памятной карточки">
          <div className="memory-brand"><span>1С</span><strong>Цифровая логистика</strong></div>
          <p>Памятная карточка участника</p>
          <h3>{displayName}</h3>
          <span>выполнил(а) практическое задание</span>
          <strong>«Управление перевозкой в 1С:TMS»</strong>
          <footer><CheckIcon /> ЧВТ · Профессионалы</footer>
        </div>
      </section>
      <QrCard />
      <div className="finish-actions">
        <button className="button secondary" onClick={onBack}><ArrowIcon direction="left" /> Вернуться к шагу 6</button>
        <button className="button primary" onClick={onRestart}><ResetIcon /> Пройти ещё раз</button>
      </div>
    </section>
  );
}

function QrCard() {
  return (
    <div className="qr-card">
      <Image src={qrCode} alt="QR-код для открытия мастер-класса на телефоне" width={112} height={112} />
      <div>
        <strong>Открыть на телефоне</strong>
        <span>Наведите камеру на QR-код</span>
        <small>xawa-vn.github.io/1c-tms-master-class</small>
      </div>
    </div>
  );
}
