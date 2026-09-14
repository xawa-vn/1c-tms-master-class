"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { steps } from "@/data/steps";
import {
  ArrowIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
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
        <Finish completed={completedSteps} onRestart={restart} onBack={goBack} />
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
        <button className="button primary large" onClick={onStart}>
          Начать мастер-класс<ArrowIcon />
        </button>
      </div>
      <div className="welcome-visual" aria-hidden="true">
        <div className="route-map">
          <div className="route-label route-label-top"><small>Старт</small><strong>Новый рейс</strong></div>
          <div className="route-label route-label-middle"><small>Маршрут</small><strong>4 точки</strong></div>
          <div className="route-label route-label-bottom"><small>Финиш</small><strong>Документ готов</strong></div>
          <svg viewBox="0 0 500 600" fill="none">
            <path d="M112 34C386 58 410 191 233 242C47 296 67 437 354 464C439 472 455 523 407 571" stroke="currentColor" strokeWidth="2" strokeDasharray="7 10" />
          </svg>
          <span className="route-dot dot-1" /><span className="route-dot dot-2" /><span className="route-dot dot-3" />
          <div className="document-preview"><span>1С:TMS</span><div className="paper-lines" /><strong>Маршрутный лист</strong><CheckIcon /></div>
        </div>
      </div>
      <p className="competence">Компетенция «Специалист по контролю качества транспортных логистических процессов»</p>
    </section>
  );
}

function Finish({ completed, onRestart, onBack }: { completed: number; onRestart: () => void; onBack: () => void }) {
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
      <div className="finish-actions">
        <button className="button secondary" onClick={onBack}><ArrowIcon direction="left" /> Вернуться к шагу 6</button>
        <button className="button primary" onClick={onRestart}><ResetIcon /> Пройти ещё раз</button>
      </div>
    </section>
  );
}
