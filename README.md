# ICML 2026 — AI의 최고점과 현실의 품질

삼성전자 TSP 품질 엔지니어 청중을 가정한 22장짜리 웹 슬라이드입니다. ICML 2026의 친숙한 응용 연구를 소개하되, benchmark의 높은 점수가 지저분하고 변화하는 현실 데이터에서 그대로 재현되지는 않는다는 관점을 발표 전체에 연결했습니다.

라이브 슬라이드: <https://wseokyang.github.io/icml-2026-ai-quality-slides/>

기본 발표 모드에서는 활성 슬라이드 한 장만 화면에 표시됩니다. 전체 22장을 한 페이지에서 보고 싶을 때만 `O` 키로 overview를 엽니다. 7개 논문 사례는 각각 `핵심 아이디어 → 논문 상세` 2장 세트로 구성되어 있습니다.

## 실행

별도 설치나 빌드 과정은 없습니다.

```bash
cd /home/wseokyang/wsy/icml-2026-ai-quality-slides
python3 -m http.server 4173
```

브라우저에서 `http://localhost:4173`을 열면 됩니다. `index.html`을 직접 열어도 대부분 동작하지만, 브라우저의 보안 제약을 피하려면 로컬 서버 실행을 권장합니다.

## 발표 조작

- `←` / `→`, `↑` / `↓`, `Page Up` / `Page Down`, `Space`: 슬라이드 이동
- 마우스 휠 / 트랙패드: 한 장씩 이동
- `Home` / `End`: 처음 / 마지막 슬라이드
- `N`: 현재 슬라이드 발표자 노트
- `O`: 전체 슬라이드 보기
- `S`: 논문 출처 패널
- `F`: 전체 화면
- `Esc`: 열린 패널 또는 전체 보기 닫기
- 모바일: 좌우 스와이프, 내용이 긴 장은 해당 장 안에서만 세로 스크롤

각 슬라이드는 URL hash를 가집니다. 예를 들어 `http://localhost:4173/#10`은 “오염된 정상 데이터” 슬라이드로 바로 이동합니다.

## PDF로 저장

브라우저 인쇄에서 다음을 선택합니다.

1. 대상: PDF로 저장
2. 레이아웃: 가로
3. 배경 그래픽: 켜기
4. 여백: 없음

인쇄 스타일은 16:9 비율로 설정되어 있습니다.

## 파일

- `index.html`: 22장 콘텐츠, 발표자 노트, 출처 링크
- `styles.css`: Apple-inspired 시각 시스템, 반응형·인쇄 스타일
- `slides.js`: 키보드·터치 이동, 전체 보기, 노트, 전체 화면
- `assets/PretendardVariable.woff2`: 발표 PC와 무관하게 한글을 표시하는 로컬 웹폰트

## 내용 해석 시 주의

- SOTA는 동일 benchmark와 평가 규칙 안에서의 최고 성능이며 human-level 또는 deployment-ready와 같은 뜻이 아닙니다.
- MeDS의 40% contamination은 실제 fab 데이터가 아니라 통제된 오염 실험입니다.
- DDL의 `+105%`는 상대 향상이며 절대 mAP@75는 `0.036 → 0.075`입니다.
- anomaly detection의 AUROC는 실제 운영 threshold에서의 precision, false alarm 비용과 다릅니다.
- 발표에 사용한 수치는 각 슬라이드의 `Reality Check`, 발표자 노트, 출처 패널에서 한계를 함께 확인할 수 있습니다.

## 디자인 및 출처

시각 방향은 [getdesign.md의 Apple 디자인 분석](https://getdesign.md/apple/design-md)에 나온 큰 시스템 서체, 넓은 여백, 흑백 장면 전환, 제한된 파란색 강조를 참고했습니다. Apple 로고나 이미지 자산은 사용하지 않았습니다.

한글 폰트는 SIL Open Font License 1.1의 [Pretendard](https://github.com/orioncactus/pretendard)를 포함하며, 라이선스 전문은 `assets/Pretendard-LICENSE.txt`에 있습니다.

논문 원문과 ICML 공식 페이지는 마지막 슬라이드의 `Sources & controls` 또는 `S` 키로 열 수 있습니다.
