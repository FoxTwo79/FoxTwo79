// n.mjs
import fs from "node:fs/promises";

// 0.5 sec delay helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  // 1. Read allLeadBypages.json
  const jsonUrl = new URL("./allLeadBypages.json", import.meta.url);
  const jsonText = await fs.readFile(jsonUrl, "utf8");
  const leadsData = JSON.parse(jsonText);

  // Process all numbered JSON objects
  const allDates = {};
  for (const key in leadsData) {
    if (leadsData[key].results && leadsData[key].results.data) {
      Object.assign(allDates, leadsData[key].results.data);
    }
  }

  const dates = allDates;

  // 2. CSV header (added api_user_phone at end)
  const header = [
    "date",
    "lead_id",
    "group_id",
    "name",
    "report_text",
    "subject_text",
    "sms_send_text",
    "new_areacity",
    "subject_areacity",
    "areacity",
    "enquiry_txt",
    "banner_flag",
    "user_city",
    "api_user_phone"   // <-- NEW COLUMN
  ];

  const csvRows = [];
  csvRows.push(header);

  let totalLeads = 0;
  let processedLeads = 0;
  
  // Count total leads
  for (const date in dates) {
    totalLeads += dates[date].leads.length;
  }

  for (const date in dates) {
    const day = dates[date];

    for (const lead of day.leads) {
      processedLeads++;
      const userPhone = encodeURIComponent(lead.user_phone || "");

      const body =
        `bc_docid=&docid=079PXX79.XX79.250213141850.X9D8` +
        `&userid=${userPhone}` +
        `&requestdetails%5Brootvc%5D=0` +
        `&requestdetails%5Bdocid%5D=079PXX79.XX79.250213141850.X9D8` +
        `&requestdetails%5Bep%5D=leads_section` +
        `&requestdetails%5Bhide_header%5D=1` +
        `&requestdetails%5Bjdbusiness%5D=1` +
        `&requestdetails%5Bm%5D=1` +
        `&requestdetails%5Bold%5D=1` +
        `&requestdetails%5Bsource%5D=77` +
        `&requestdetails%5Btab%5D=enquiries` +
        `&requestdetails%5Bwkwebview%5D=1` +
        `&currentLead%5Bgroup_id%5D=${encodeURIComponent(lead.group_id || "")}` +
        `&currentLead%5Blead_id%5D=${encodeURIComponent(lead.lead_id || "")}` +
        `&currentLead%5Buser_phone%5D=${userPhone}` +
        `&currentLead%5Bencryption_flag%5D=1&`;

      let apiPhone = ""; // <-- store API phone number here

      try {
        const res = await fetch(
          "https://wap.justdial.com/analyticsapis/getInfo?m=1&old=1",
          {
            method: "POST",
            headers: {
              "accept": "application/json, text/plain, */*",
              "content-type": "application/x-www-form-urlencoded",
              "cookie": "_gcl_au=1.1.2005384935.1763201548; _fbp=fb.1.1763201547563.76672180621230992; ppc=; _ga=GA1.1.1430849974.1763201548; TKY=7c9cef42a077cdf86c4d410c26588352b538b7405a7491962ba7c63f677204f7; main_city=Mumbai; _ctok=FA4B784C72F6201011B3A8333BDF54E5D648156520251115154430WWW691852863194B; jdeflg=3; jdvn=0; attn_user=login; JDTID=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0aWQiOiJCRjlsT3lkVDlqV3VUOGFKYzFrR2pkWjVQTFRpNjJxbUtwMzRZc3FHZWE5d1pHbE11NU5VS1ZvKzl1TWpsXC8xOE52S3JYaStWRGtraUpDST0iLCJsZSI6ImFXVWRIdkhCVmxQTEdDUGlZMVNwQWN0WHJ2ZFFLMm5wQnZIWm1XUko3TGhzZ1R4VkdDak9hMGlzV2phXC8xU2JKbWc0PSIsImRpIjoiRkE0Qjc4NEM3MkY2MjAxMDExQjNBODMzM0JERjU0RTVENjQ4MTU2NTIwMjUxMTE1MTU0NDMwV1dXNjkxODUyODYzMTk0QiIsImtpZCI6MSwiaWF0IjoiMjAyNS0xMS0xNSAxNTo0NToxMCIsIm10IjoiMjAyNTExMTUxNTQ1MTBKRExHTjY5MTg1MkFFNTJFQjIiLCJ1IjoiMTVlNjU2NTk1Mzg5MmE3MjQzMzhhY2VkOGI1YWZlYjYzMTk0MGNjNjExMDc3ZDIzZGUyMTlhZjdjYjI2MjZmYyIsImV4dCI6InVUc2ZxZFpcL0xMUTBSMDY3aUMwOCsyaW9DcmhIM29yeThQSDllME95MitRV1hXeVwvVnNlcWVKSjR1SzdNWjRtcVJKWVpqNmpQdkpoQllFaFBsRUFMc0hORFkwd0crdTh2dTYrU05jcDd5Smo4RjBsM1Y0eklRN3d0Y3M4MFZiamV4RWtMRWF2c1RicldwYWVGeFpzPSIsImlzcyI6Imp1c3RkaWFsLmNvbSJ9.BLQgmBkXhvA69hDgokCdhjWCNINbMkO9HQJsSbIo4n4; deviceId=FA4B784C72F6201011B3A8333BDF54E5D648156520251115154430WWW691852863194B; sid=WgDAHQdsWnlQu0LhvHN78iz9gtwdP5Ff7Ek8QHIAHPk%253D; JDSID=WgDAHQdsWnlQu0LhvHN78iz9gtwdP5Ff7Ek8QHIAHPk%253D; JDINF=RklZc2l1WmFsZ3Z2RDQ5Ti9mQlB4bmtrZWUrOGN0MlM1VnFJYW5yeXo3bFdzUGE3dXpWckdqSStPdnJFS2JGT2dpQUVpcFRSMGpGL1hHeU44cHVUNUN1VDFaTEVXcUJaMmFSaWVKK2RCMmRCZ2cxTmhEMHlHazlKdzZPa1QrSnRsMzBhZjk5VTNxTm81amVOMWlpd0VSYzVsVkMycWg0aEM2c3pOdzhvSGhhdVNEZkxTVzh4TnRSRWFwK2doSEtvT3pXc0VRRnhqZldLTnJaUm5MWGxFYVgxNURMWEJZblJCdUlYR2RmdnZVND0%3D; lgtyp=1; new_user=0; jde=0; PHPSESSID=osk9uhlln90jtchevuffb7pf82; leads-analytics=rd1131o00000000000000000000ffffc0a8187ao80; RT=\"z=1&dm=justdial.com&si=14028f91-63e2-4d42-826e-78811265c9fb&ss=mi04ocf3&sl=3&tt=2v7&bcn=%2F%2F684d0d48.akstat.io%2F&ld=3oph&hd=3q8v\"; UpgradeNow_undefined=1; disposition_tag_079PXX79.XX79.250213141850.X9D8=U3VuIE5vdiAxNiAyMDI1IDE2OjA3OjI2IEdNVCswNTMwIChJbmRpYSBTdGFuZGFyZCBUaW1lKQ==; _ga_2P8P2YKNMG=GS2.1.s1763210033$o1$g1$t1763210112$j60$l0$h0; bm_sz=B808C283A5FB94E83D110B30D2E7A58A~YAAQ5OwsF2n3FoiaAQAAQ7OQiB1v0gK4eD6eG8ehdpfd9ZV+sp2kUQ6yDVJEre8TyiJF8aWIzdYwlLNnH9yro5pXeCoQ/XQvX2+qUHomBjZ16ebvOIGR1Xrf5yKyUHcACw8SXYEQmVS9GABH5rxtjsJiC9D7B7TcOaqndpEW9NT0mtQIN25Udp0es3NUgIgTBWDjyPq2q7YNdAF83bTILxbs5aySwXgaDS+tGXC891IDxglLd9g9JsdAWoTH0DDhvpCHsBIihvcr9iSC9Kc5oT75cOhIp2zHKxFVjGv9bHobmbnfIvmvN5nBqGD7iuHpjQWmKPtonAFqbLn/iFRR2dwOsB17FKHHTnXQhDBZ1oQhDl1gM3BEz+zD+IduXteI8Nl7fPaT1J7xQi7TxyI1Ov15/KPkXj7zibi5vaTJ+amQXuLjsmpH3XayfcUANfHidW5Uuphv~3229235~3159108; old=1; active_banners_gujarat=W10=; _ga_5PY4KYQRFS=GS2.1.s1763231337$o7$g1$t1763231338$j59$l0$h0; _ga_PGCZHZY9JF=GS2.1.s1763231337$o5$g1$t1763231338$j59$l0$h0; _uetsid=970ff110c20b11f0986315952c20a38f; _uetvid=97119c80c20b11f0a550df44b736a183; ak_bmsc=0A6F492A10429DFB304824D6AF8A4AB2~000000000000000000000000000000~YAAQoAkgF0GtzHaaAQAAfRLHiB32R9f6kVlEDG6juP6wQUrLBA1kwXr1orPu/uFLH2BJs4obVHFsscphI8AKb7uC+rf1n/Qzs97li2wfO/m4zQkM29jgBrm1Tl+GuVx7yyZONrdim3+Cc6M09Hk/amoadnQAhR7BjXHweNwgD4S62nWwLiZDozlRKXC/9QwLUV7Rd7PCpXBEYa0xkyepyl0DtgFpodz1feI6NtIl7Su+yjyZLpDiVNFc4IYjdWdu9MZwb7McwBRqJK7TZcfNtRX/9+/Yz+S4RkH8dKvxolXzYq/LwQTnxO6X4VVoqh7JjoOWIYtcHqIV1iYGWd9Zk3p6BjcyB4xaHwhKPNPI6zJSUyS0cJRJRwgHjeFEITaVA+85jMli2dIfNpig0qhOsSvWRZEVNeFGZlHpPpTentca3gN+a9kw7YltYwu0vl7AZVw=; _abck=BF8053BD39D6B500DC664723F8DFDA66~0~YAAQ3+wsF2Hs64WaAQAAQgXviA7vFutA3WECjAM8rBdFGxYx3jnHw+j+Oao0R36fVHRuEt+zGPl983qisdkvUjymsfHOt/L432ansSIV3JY33kigLS5XvCOKRSjR0YXbO8Al066fsbnKEunCik6XSsXkbS3ofaFxBPsDusTjR9728LZBJEJkGzTrlN1HZKL4A1uk0GfEDKc18KUBcOp4n2vYBj1Dcl9EOLxElJSyTHzaDe+uH4qktmMrgGq5DE45V1aXS2/eiffBaxs+5LvF+7WZxyyDR7EKhXXu+u1fe72RtkANdTipPb4JKTqstOqBlBG0hAaUhrY3yQ/qO4NPsiGi7AQXGrXL4RbgnkNhie7h+c6EbouJvNw6wjOBTfK01ZCaEdX7Po2b756zsqj4i6mmC+/mfWOb/1fZ3HQSzGAjQ6YDzQaoEcnMQKvaTGFSMjNYH6qG3zDv2q2MoCybUd78O+0DI3/uP+HLvFLWvur5Hwf8Av9txZUlET75zGBj17+BvnO34ttVWF5aVVeI83/YHI/VXICwFws7WJmns0dD6BHWfTO/N71qw91QnoHlufBD3fVL+iqExqC90GF6RtGNM7GloEpe6WL1fiKIjhp9qBVS8O+3mBFbP52ge2rFyA0=~-1~-1~-1~AAQAAAAE%2f%2f%2f%2f%2fgVaisBG55%2fAIrF7V1SUrLGaiOgcgi%2fICZe%2fIEZJtafntIdet0yy4omIeIAhA2uWV31bDaIg1JJmLpiGaqv6xtW31m9mhn7L6Pw~-1; bm_sv=CC7B0C439E02BA420A654C10AE268CB9~YAAQCs8uF8PLZIGaAQAA0Dr1iB0KDfXFbmkBF3jC3wedv636WF0QEPl68yP8c8BQF3QaXMVMZuG2he9zSAJdiyE5knyy3h9/bXBdAutf6BdNuaUYmF5jpF19asm3QMB97y85Am+rhFNEk9f9op3BETPylK8841fq2ncm/T2SdwqQ8fMdlFis40sGGoUgwTON3niT2B6m0u9ribGKTtUU1BAu55PMFdHIiMCgbfJ4Q+it2Dy5YoEJCKwA0K5srCs7Q6hJ~1",
            },
            body,
          }
        );

        const data = await res.json();
        console.log(`[${processedLeads}/${totalLeads}] ${date} - ${lead.lead_id}`);

        // extract phone
        apiPhone = data?.results?.data || "";
      } catch (err) {
        console.error(`[${processedLeads}/${totalLeads}] Error:`, date, lead.lead_id);
      }

      // 3. Add row into CSV (lead fields + api phone)
      const row = [
        date || "",
        lead.lead_id || "",
        lead.group_id || "",
        lead.name || "",
        lead.report_text || "",
        lead.subject_text || "",
        lead.sms_send_text || "",
        lead.new_areacity || "",
        lead.subject_areacity || "",
        lead.areacity || "",
        lead.enquiry_txt || "",
        lead.banner_flag ?? "",
        lead.user_city || "",
        apiPhone || ""         // <-- NEW DATA
      ];

      csvRows.push(row);

      // 0.5 sec delay
      await delay(1000);
    }
  }

  // 4. Convert rows to CSV
  const csvString = csvRows
    .map((cols) =>
      cols
        .map((value) => {
          const v = String(value ?? "");
          const escaped = v.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    )
    .join("\n");

  // 5. Save CSV
  const outUrl = new URL("./leads_output.csv", import.meta.url);
  await fs.writeFile(outUrl, csvString, "utf8");

  console.log("✅ CSV saved as leads_output.csv");
}

main().catch((err) => {
  console.error("Fatal error:", err);
});











