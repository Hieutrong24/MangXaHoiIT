import { useEffect, useMemo, useState } from "react";
import GlassCard from "../../../shared/components/GlassCard";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import { profileApi } from "../api/profile.api";

function parseUserId() {
  return localStorage.getItem("userId") || JSON.parse(localStorage.getItem("user") || "null")?.id || "";
}

function linesFrom(items, mapper) {
  return Array.isArray(items) ? items.map(mapper).join("\n") : "";
}

function parseMultiline(text, mapper) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map(mapper);
}

export default function EditProfilePage() {
  const userId = useMemo(parseUserId, []);
  const [form, setForm] = useState({
    fullName: "",
    headline: "",
    location: "",
    bio: "",
    websiteUrl: "",
    githubUrl: "",
    linkedInUrl: "",
    portfolioUrl: "",
    phoneNumber: "",
    dateOfBirth: "",
    currentYear: "",
    gpa: "",
    careerGoal: "",
    preferredJobTitle: "",
    preferredLocation: "",
    avatarUrl: "",
    coverUrl: "",
    openToInternship: false,
    openToJob: false,
    openToCollab: true,
    skillsText: "",
    educationText: "",
    experiencesText: "",
    certificatesText: "",
    projectsText: "",
    cvsText: "",
    highlightsText: "",
    contributionsText: "",
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const p = await profileApi.getFull(userId).catch(() => null);
      if (!p) return;
      setForm({
        fullName: p.fullName || "",
        headline: p.headline || "",
        location: p.location || "",
        bio: p.bio || "",
        websiteUrl: p.websiteUrl || "",
        githubUrl: p.githubUrl || "",
        linkedInUrl: p.linkedInUrl || "",
        portfolioUrl: p.portfolioUrl || "",
        phoneNumber: p.phoneNumber || "",
        dateOfBirth: p.dateOfBirth || "",
        currentYear: p.currentYear ?? "",
        gpa: p.gpa ?? "",
        careerGoal: p.careerGoal || "",
        preferredJobTitle: "",
        preferredLocation: p.preferredLocation || "",
        avatarUrl: p.avatarUrl || "",
        coverUrl: p.coverUrl || "",
        openToInternship: !!p.openToInternship,
        openToJob: false,
        openToCollab: p.openToCollab !== false,
        skillsText: linesFrom(p.skills, (x) => `${x.skillName}|${x.category || ""}|${x.proficiencyLevel || ""}|${x.yearsOfExperience || ""}|${x.isPrimary ? 1 : 0}|${x.displayOrder || 0}`),
        educationText: linesFrom(p.educations, (x) => `${x.schoolName}|${x.degree || ""}|${x.major || ""}|${x.startDate || ""}|${x.endDate || ""}|${x.isCurrent ? 1 : 0}|${x.gpa || ""}|${x.description || ""}|${x.displayOrder || 0}`),
        experiencesText: linesFrom(p.experiences, (x) => `${x.companyName}|${x.positionTitle}|${x.employmentType || ""}|${x.location || ""}|${x.isRemote ? 1 : 0}|${x.startDate || ""}|${x.endDate || ""}|${x.isCurrent ? 1 : 0}|${x.description || ""}|${x.techStack || ""}|${x.achievementSummary || ""}|${x.displayOrder || 0}`),
        certificatesText: linesFrom(p.certificates, (x) => `${x.certificateName}|${x.issuer || ""}|${x.issueDate || ""}|${x.expirationDate || ""}|${x.credentialId || ""}|${x.credentialUrl || ""}|${x.attachmentUrl || ""}|${x.description || ""}|${x.displayOrder || 0}`),
        projectsText: linesFrom(p.projects, (x) => `${x.projectName}|${x.slug || ""}|${x.summary || ""}|${x.description || ""}|${x.repositoryUrl || ""}|${x.demoUrl || ""}|${x.thumbnailUrl || ""}|${x.bannerUrl || ""}|${x.primaryLanguage || ""}|${(x.techStack || []).join(",")}|${x.visibility ?? 1}|${x.isPinned ? 1 : 0}|${x.isFeatured ? 1 : 0}|${x.isAcademicProject ? 1 : 0}|${x.starsCount || 0}|${x.forksCount || 0}|${x.watchersCount || 0}|${x.commitCount || 0}|${x.lastContributionAt || ""}|${x.startedAt || ""}|${x.completedAt || ""}|${x.displayOrder || 0}`),
        cvsText: linesFrom(p.cvs, (x) => `${x.cvTitle}|${x.fileName}|${x.fileUrl}|${x.fileExt || ""}|${x.fileSizeBytes || ""}|${x.mimeType || ""}|${x.versionNo || 1}|${x.isPrimary ? 1 : 0}|${x.isPublic ? 1 : 0}|${x.summary || ""}`),
        highlightsText: linesFrom(p.highlights, (x) => `${x.highlightType}|${x.title}|${x.description || ""}|${x.refUrl || ""}|${x.refId || ""}|${x.displayOrder || 0}|${x.isVisible ? 1 : 0}`),
        contributionsText: linesFrom(p.contributions, (x) => `${x.sourceType}|${x.sourceId}|${x.sourceTitle || ""}|${x.contributionDate}|${x.contributionCount || 1}`),
      });
    })();
  }, [userId]);

  async function handleSave() {
    try {
      setSaving(true);
      setMessage("");
      const payload = {
        fullName: form.fullName,
        headline: form.headline,
        location: form.location,
        bio: form.bio,
        websiteUrl: form.websiteUrl,
        githubUrl: form.githubUrl,
        linkedInUrl: form.linkedInUrl,
        portfolioUrl: form.portfolioUrl,
        phoneNumber: form.phoneNumber,
        dateOfBirth: form.dateOfBirth || null,
        currentYear: form.currentYear ? Number(form.currentYear) : null,
        gpa: form.gpa ? Number(form.gpa) : null,
        careerGoal: form.careerGoal,
        preferredJobTitle: "",
        preferredLocation: form.preferredLocation,
        avatarUrl: form.avatarUrl,
        coverUrl: form.coverUrl,
        openToInternship: form.openToInternship,
        openToJob: false,
        openToCollab: form.openToCollab,
        skills: parseMultiline(form.skillsText, (line) => { const [skillName, category, proficiencyLevel, yearsOfExperience, isPrimary, displayOrder] = line.split("|"); return { skillName: skillName?.trim(), category: category?.trim() || null, proficiencyLevel: proficiencyLevel ? Number(proficiencyLevel) : null, yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : null, isPrimary: String(isPrimary || "").trim() === "1", displayOrder: Number(displayOrder || 0) }; }),
        educations: parseMultiline(form.educationText, (line) => { const [schoolName, degree, major, startDate, endDate, isCurrent, gpa, description, displayOrder] = line.split("|"); return { schoolName: schoolName?.trim(), degree: degree?.trim() || null, major: major?.trim() || null, startDate: startDate?.trim() || null, endDate: endDate?.trim() || null, isCurrent: String(isCurrent || "").trim() === "1", gpa: gpa ? Number(gpa) : null, description: description?.trim() || null, displayOrder: Number(displayOrder || 0) }; }),
        experiences: parseMultiline(form.experiencesText, (line) => { const [companyName, positionTitle, employmentType, location, isRemote, startDate, endDate, isCurrent, description, techStack, achievementSummary, displayOrder] = line.split("|"); return { companyName: companyName?.trim(), positionTitle: positionTitle?.trim(), employmentType: employmentType?.trim() || null, location: location?.trim() || null, isRemote: String(isRemote || "").trim() === "1", startDate: startDate?.trim() || null, endDate: endDate?.trim() || null, isCurrent: String(isCurrent || "").trim() === "1", description: description?.trim() || null, techStack: techStack?.trim() || null, achievementSummary: achievementSummary?.trim() || null, displayOrder: Number(displayOrder || 0) }; }),
        certificates: parseMultiline(form.certificatesText, (line) => { const [certificateName, issuer, issueDate, expirationDate, credentialId, credentialUrl, attachmentUrl, description, displayOrder] = line.split("|"); return { certificateName: certificateName?.trim(), issuer: issuer?.trim() || null, issueDate: issueDate?.trim() || null, expirationDate: expirationDate?.trim() || null, credentialId: credentialId?.trim() || null, credentialUrl: credentialUrl?.trim() || null, attachmentUrl: attachmentUrl?.trim() || null, description: description?.trim() || null, displayOrder: Number(displayOrder || 0) }; }),
        projects: parseMultiline(form.projectsText, (line) => { const [projectName, slug, summary, description, repositoryUrl, demoUrl, thumbnailUrl, bannerUrl, primaryLanguage, techStack, visibility, isPinned, isFeatured, isAcademicProject, starsCount, forksCount, watchersCount, commitCount, lastContributionAt, startedAt, completedAt, displayOrder] = line.split("|"); return { projectName: projectName?.trim(), slug: slug?.trim() || null, summary: summary?.trim() || null, description: description?.trim() || null, repositoryUrl: repositoryUrl?.trim() || null, demoUrl: demoUrl?.trim() || null, thumbnailUrl: thumbnailUrl?.trim() || null, bannerUrl: bannerUrl?.trim() || null, primaryLanguage: primaryLanguage?.trim() || null, techStack: (techStack || "").split(",").map((x) => x.trim()).filter(Boolean), visibility: Number(visibility || 1), isPinned: String(isPinned || "").trim() === "1", isFeatured: String(isFeatured || "").trim() === "1", isAcademicProject: String(isAcademicProject || "").trim() === "1", starsCount: Number(starsCount || 0), forksCount: Number(forksCount || 0), watchersCount: Number(watchersCount || 0), commitCount: Number(commitCount || 0), lastContributionAt: lastContributionAt?.trim() || null, startedAt: startedAt?.trim() || null, completedAt: completedAt?.trim() || null, displayOrder: Number(displayOrder || 0) }; }),
        cvs: parseMultiline(form.cvsText, (line) => { const [cvTitle, fileName, fileUrl, fileExt, fileSizeBytes, mimeType, versionNo, isPrimary, isPublic, summary] = line.split("|"); return { cvTitle: cvTitle?.trim(), fileName: fileName?.trim(), fileUrl: fileUrl?.trim(), fileExt: fileExt?.trim() || null, fileSizeBytes: fileSizeBytes ? Number(fileSizeBytes) : null, mimeType: mimeType?.trim() || null, versionNo: Number(versionNo || 1), isPrimary: String(isPrimary || "").trim() === "1", isPublic: String(isPublic || "").trim() === "1", summary: summary?.trim() || null }; }),
        highlights: parseMultiline(form.highlightsText, (line) => { const [highlightType, title, description, refUrl, refId, displayOrder, isVisible] = line.split("|"); return { highlightType: highlightType?.trim(), title: title?.trim(), description: description?.trim() || null, refUrl: refUrl?.trim() || null, refId: refId?.trim() || null, displayOrder: Number(displayOrder || 0), isVisible: String(isVisible || "").trim() !== "0" }; }),
        contributions: parseMultiline(form.contributionsText, (line) => { const [sourceType, sourceId, sourceTitle, contributionDate, contributionCount] = line.split("|"); return { sourceType: sourceType?.trim(), sourceId: sourceId?.trim(), sourceTitle: sourceTitle?.trim() || null, contributionDate: contributionDate?.trim(), contributionCount: Number(contributionCount || 1) }; }),
      };
      await profileApi.updateFull(userId, payload);
      setMessage("Đã lưu hồ sơ thành công.");
    } catch (e) {
      setMessage(e?.response?.data?.message || e.message || "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <GlassCard className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">Chỉnh sửa trang cá nhân</div>
            <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">Cập nhật portfolio, dự án và CV</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Các ô nhập liệu sử dụng cú pháp mỗi dòng cho danh sách, phù hợp khi cần chỉnh nhanh hồ sơ nhiều mục.</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</Button>
        </div>
        {message ? <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">{message}</div> : null}
      </GlassCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <GlassCard className="space-y-3 p-5">
          <div className="text-sm font-bold text-white">Thông tin chính</div>
          <Input placeholder="Họ tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <Input placeholder="Headline" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
          <Input placeholder="Địa điểm" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Input placeholder="Số điện thoại" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2"><Input placeholder="Ngày sinh YYYY-MM-DD" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /><Input placeholder="Năm học hiện tại" value={form.currentYear} onChange={(e) => setForm({ ...form, currentYear: e.target.value })} /></div>
          <Input placeholder="GPA" value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} />
          <textarea className="w-full rounded-2xl border border-white/10 bg-slate-900/80 p-3 text-sm text-white" rows={4} placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <textarea className="w-full rounded-2xl border border-white/10 bg-slate-900/80 p-3 text-sm text-white" rows={4} placeholder="Mục tiêu phát triển" value={form.careerGoal} onChange={(e) => setForm({ ...form, careerGoal: e.target.value })} />
          <div className="grid gap-2 sm:grid-cols-3 text-sm text-slate-200">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.openToInternship} onChange={(e) => setForm({ ...form, openToInternship: e.target.checked })} /> Internship</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.openToCollab} onChange={(e) => setForm({ ...form, openToCollab: e.target.checked })} /> Collab</label>
          </div>
        </GlassCard>

        <GlassCard className="space-y-3 p-5">
          <div className="text-sm font-bold text-white">Liên kết & media</div>
          <Input placeholder="Website URL" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} />
          <Input placeholder="GitHub URL" value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} />
          <Input placeholder="LinkedIn URL" value={form.linkedInUrl} onChange={(e) => setForm({ ...form, linkedInUrl: e.target.value })} />
          <Input placeholder="Portfolio URL" value={form.portfolioUrl} onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })} />
          <Input placeholder="Preferred Location" value={form.preferredLocation} onChange={(e) => setForm({ ...form, preferredLocation: e.target.value })} />
          <Input placeholder="Avatar URL" value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} />
          <Input placeholder="Cover URL" value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} />
        </GlassCard>
      </div>

      <GlassCard className="space-y-4 p-5">
        <Field title="Kỹ năng" hint="skillName|category|proficiencyLevel|years|isPrimary(0/1)|displayOrder" value={form.skillsText} onChange={(value) => setForm({ ...form, skillsText: value })} rows={5} />
        <Field title="Học vấn" hint="school|degree|major|start|end|isCurrent|gpa|description|displayOrder" value={form.educationText} onChange={(value) => setForm({ ...form, educationText: value })} rows={5} />
        <Field title="Kinh nghiệm" hint="company|position|employmentType|location|isRemote|start|end|isCurrent|description|techStack|achievementSummary|displayOrder" value={form.experiencesText} onChange={(value) => setForm({ ...form, experiencesText: value })} rows={6} />
        <Field title="Chứng chỉ" hint="name|issuer|issueDate|expirationDate|credentialId|credentialUrl|attachmentUrl|description|displayOrder" value={form.certificatesText} onChange={(value) => setForm({ ...form, certificatesText: value })} rows={5} />
        <Field title="Dự án" hint="projectName|slug|summary|description|repo|demo|thumb|banner|language|tech1,tech2|visibility|isPinned|isFeatured|isAcademic|stars|forks|watchers|commits|lastContributionAt|startedAt|completedAt|displayOrder" value={form.projectsText} onChange={(value) => setForm({ ...form, projectsText: value })} rows={8} />
        <Field title="CV" hint="cvTitle|fileName|fileUrl|fileExt|fileSizeBytes|mimeType|version|isPrimary|isPublic|summary" value={form.cvsText} onChange={(value) => setForm({ ...form, cvsText: value })} rows={4} />
        <Field title="Highlights" hint="highlightType|title|description|refUrl|refId|displayOrder|isVisible" value={form.highlightsText} onChange={(value) => setForm({ ...form, highlightsText: value })} rows={4} />
        <Field title="Contributions" hint="sourceType|sourceId|sourceTitle|YYYY-MM-DD|count" value={form.contributionsText} onChange={(value) => setForm({ ...form, contributionsText: value })} rows={4} />
      </GlassCard>
    </div>
  );
}

function Field({ title, hint, value, onChange, rows = 5 }) {
  return (
    <div>
      <div className="text-sm font-bold text-white">{title}</div>
      <div className="mt-1 text-xs text-slate-500">{hint}</div>
      <textarea className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/80 p-3 font-mono text-sm text-white" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
