/**
 * 영어 일기 에세이 학습 다이어리 - Google Apps Script (GAS) 스프레드시트 어댑터
 * 
 * [ 설치 및 배포 방법 ]
 * 1. 구글 스프레드시트(구글 드라이브)를 새로 만듭니다.
 * 2. 상단 메뉴에서 [확장 프로그램] -> [Apps Script]를 선택합니다.
 * 3. 기본 생성된 코드(Code.gs)의 내용을 모두 지우고 아래의 코드를 붙여넣습니다.
 * 4. 상단 세이브 아이콘을 눌러 저장합니다.
 * 5. 우측 상단의 [배포] -> [새 배포]를 클릭합니다.
 * 6. 유형 선택에서 톱니바퀴 아이콘을 누르고 [웹 앱]을 선택합니다.
 * 7. 다음 설정을 적용합니다:
 *    - 설명: 영어 에세이 DB 웹앱 배포
 *    - 다음 사용자 권한으로 실행: 나 (your-email@gmail.com)
 *    - 액세스 권한이 있는 사용자: 모든 사용자 (Anyone) -> 중요!
 * 8. [배포] 버튼을 누르고, 최초 실행 시 '액세스 권한 허용' 승인 팝업이 뜨면 계정을 선택하고 허용해줍니다.
 * 9. 생성된 "웹 앱 URL"을 복사하여, 웹 애플리케이션의 설정(구글 스프레드시트 연동) 메뉴에 붙여넣습니다.
 */

function doGet(e) {
  return handleResponse(getAllData());
}

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var payload = JSON.parse(rawData);
    var action = payload.action; // "save", "delete", "sync"
    
    if (action === "save") {
      var essay = payload.data;
      var result = saveEssay(essay);
      return handleResponse({ success: true, message: "Saved successfully", result: result });
    } else if (action === "delete") {
      var id = payload.id;
      var result = deleteEssay(id);
      return handleResponse({ success: true, message: "Deleted successfully", deletedId: id });
    } else if (action === "sync") {
      var localEssays = payload.essays || [];
      var synced = syncEssays(localEssays);
      return handleResponse({ success: true, message: "Synced successfully", essays: synced });
    } else {
      return handleResponse({ success: false, message: "Unknown action: " + action });
    }
  } catch(error) {
    return handleResponse({ success: false, message: error.toString() });
  }
}

// 응답을 JSON 및 CORS 지원 헤더와 함께 전송
function handleResponse(responseObj) {
  var output = ContentService.createTextOutput(JSON.stringify(responseObj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// 시트 가져오기 또는 자동 생성
function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Essays");
  if (!sheet) {
    sheet = ss.insertSheet("Essays");
    // 헤더 열 작성
    sheet.appendRow([
      "ID", 
      "Title", 
      "CreatedAt", 
      "KoreanSentences", 
      "EnglishSentences", 
      "Memo", 
      "Confidence", 
      "IsFavorite"
    ]);
    // 헤더 스타일 적용 (굵게, 배경색)
    var headerRange = sheet.getRange(1, 1, 1, 8);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#E0F2FE");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// 모든 데이터 가져오기
function getAllData() {
  var sheet = getOrCreateSheet();
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) {
    return [];
  }
  
  var essays = [];
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (!row[0]) continue; // ID가 비었으면 스킵
    
    try {
      essays.push({
        id: String(row[0]),
        title: String(row[1]),
        createdAt: String(row[2]),
        koreanSentences: JSON.parse(row[3] || "[]"),
        englishSentences: JSON.parse(row[4] || "[]"),
        memo: String(row[5]),
        confidence: Number(row[6] || 0),
        isFavorite: row[7] === true || row[7] === "TRUE" || row[7] === 1
      });
    } catch(err) {
      // JSON 파싱 실패시 텍스트 통으로 처리
      essays.push({
        id: String(row[0]),
        title: String(row[1]),
        createdAt: String(row[2]),
        koreanSentences: [String(row[3] || "")],
        englishSentences: [String(row[4] || "")],
        memo: String(row[5]),
        confidence: Number(row[6] || 0),
        isFavorite: row[7] === true || row[7] === "TRUE" || row[7] === 1
      });
    }
  }
  return essays;
}

// 에세이 저장 (추가 또는 업데이트)
function saveEssay(essay) {
  var sheet = getOrCreateSheet();
  var rows = sheet.getDataRange().getValues();
  var foundRowIdx = -1;
  
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(essay.id)) {
      foundRowIdx = i + 1; // 1-based index for sheets, +1 offset because row is 0-indexed in loop
      break;
    }
  }
  
  var koreanStr = JSON.stringify(essay.koreanSentences || []);
  var englishStr = JSON.stringify(essay.englishSentences || []);
  var confidence = Number(essay.confidence !== undefined ? essay.confidence : 0);
  var isFav = essay.isFavorite === true;
  
  var rowData = [
    essay.id,
    essay.title,
    essay.createdAt,
    koreanStr,
    englishStr,
    essay.memo || "",
    confidence,
    isFav
  ];
  
  if (foundRowIdx > 0) {
    // 업데이트
    sheet.getRange(foundRowIdx, 1, 1, 8).setValues([rowData]);
  } else {
    // 신규 추가
    sheet.appendRow(rowData);
  }
  return essay;
}

// 에세이 삭제
function deleteEssay(id) {
  var sheet = getOrCreateSheet();
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

// 오프라인/로컬 데이터와 스프레드시트 데이터 양방향 싱크 (시간 기준 최신 우선)
function syncEssays(localEssays) {
  var dbEssays = getAllData();
  var dbMap = {};
  dbEssays.forEach(function(e) {
    dbMap[e.id] = e;
  });
  
  var localMap = {};
  localEssays.forEach(function(e) {
    localMap[e.id] = e;
  });
  
  // 모든 ID 수집
  var allIds = {};
  dbEssays.forEach(function(e) { allIds[e.id] = true; });
  localEssays.forEach(function(e) { allIds[e.id] = true; });
  
  var finalEssays = [];
  var idsToSave = [];
  
  Object.keys(allIds).forEach(function(id) {
    var dbItem = dbMap[id];
    var localItem = localMap[id];
    
    if (dbItem && localItem) {
      // 둘 다 존재하면, createdAt 또는 수정시간 로직이 없으므로, 기본적으로 confidence나 세부 필드로 비교하거나 
      // 로컬 항목을 우선하고 DB를 업데이트 (혹은 그 반대). 여기서는 로컬을 우선하여 DB에 써줍니다.
      saveEssay(localItem);
      finalEssays.push(localItem);
    } else if (dbItem) {
      // DB에만 있음 -> 로컬로 보냄
      finalEssays.push(dbItem);
    } else if (localItem) {
      // 로컬에만 있음 -> DB에 저장
      saveEssay(localItem);
      finalEssays.push(localItem);
    }
  });
  
  return finalEssays;
}
