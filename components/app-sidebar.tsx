"use client"

import * as React from "react"
import { Building2, BookOpen, FileQuestion, GraduationCap } from "lucide-react"
import { api } from "@/lib/api"
import { Organization, Exam, Question } from "@/types/api"

import { NavUser } from "@/components/nav-user"
import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"

// 导航主菜单配置
const navMain = [
  {
    title: "考试联盟",
    key: "organizations",
    icon: Building2,
    isActive: true,
  },
  {
    title: "历场考试",
    key: "exams",
    icon: GraduationCap,
    isActive: false,
  },
  {
    title: "原味题目",
    key: "questions",
    icon: FileQuestion,
    isActive: false,
  },
]

// 用户数据
const userData = {
  name: "题库管理员",
  email: "admin@example.com",
  avatar: "/avatars/admin.jpg",
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onSelectedItemChange?: (type: string, id: string) => void;
}

export function AppSidebar({ onSelectedItemChange, ...props }: AppSidebarProps) {
  // 当前激活的主菜单项
  const [activeItem, setActiveItem] = React.useState(navMain[0])
  
  // 列表数据状态
  const [organizations, setOrganizations] = React.useState<Organization[]>([])
  const [exams, setExams] = React.useState<Exam[]>([])
  const [questions, setQuestions] = React.useState<Question[]>([])
  
  // 选中的项目状态
  const [selectedOrganization, setSelectedOrganization] = React.useState<Organization | null>(null)
  const [selectedExam, setSelectedExam] = React.useState<Exam | null>(null)
  const [selectedQuestion, setSelectedQuestion] = React.useState<Question | null>(null)
  
  // 加载状态
  const [loading, setLoading] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  
  const { setOpen } = useSidebar()

  // 获取组织列表
  const loadOrganizations = React.useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.organization.getList({ 
        search: searchTerm,
        pageSize: 50 
      })
      setOrganizations(response.items)
    } catch (error) {
      console.error('Failed to load organizations:', error)
    } finally {
      setLoading(false)
    }
  }, [searchTerm])

  // 获取考试列表
  const loadExams = React.useCallback(async (organizationId?: string) => {
    try {
      setLoading(true)
      const response = await api.exam.getList({ 
        organizationId,
        search: searchTerm,
        pageSize: 50 
      })
      setExams(response.items)
    } catch (error) {
      console.error('Failed to load exams:', error)
    } finally {
      setLoading(false)
    }
  }, [searchTerm])

  // 获取题目列表
  const loadQuestions = React.useCallback(async (examId?: string, organizationId?: string) => {
    try {
      setLoading(true)
      const response = await api.question.getList({ 
        examId,
        organizationId,
        search: searchTerm,
        pageSize: 50 
      })
      setQuestions(response.items)
    } catch (error) {
      console.error('Failed to load questions:', error)
    } finally {
      setLoading(false)
    }
  }, [searchTerm])

  // 切换主菜单项
  const handleMenuItemClick = React.useCallback(async (item: typeof navMain[0]) => {
    setActiveItem(item)
    setSelectedOrganization(null)
    setSelectedExam(null)
    setSelectedQuestion(null)
    
    if (item.key === 'organizations') {
      await loadOrganizations()
    } else if (item.key === 'exams') {
      await loadExams()
    } else if (item.key === 'questions') {
      await loadQuestions()
    }
    
    setOpen(true)
  }, [loadOrganizations, loadExams, loadQuestions, setOpen])

  // 选择组织
  const handleOrganizationSelect = React.useCallback(async (org: Organization) => {
    setSelectedOrganization(org)
    onSelectedItemChange?.('organization', org.id)
    
    // 如果当前是考试或题目页面，需要更新相关数据
    if (activeItem.key === 'exams') {
      await loadExams(org.id)
    } else if (activeItem.key === 'questions') {
      await loadQuestions(undefined, org.id)
    }
  }, [activeItem.key, loadExams, loadQuestions, onSelectedItemChange])

  // 选择考试
  const handleExamSelect = React.useCallback(async (exam: Exam) => {
    setSelectedExam(exam)
    onSelectedItemChange?.('exam', exam.id)
    
    // 如果当前是题目页面，加载该考试的题目
    if (activeItem.key === 'questions') {
      await loadQuestions(exam.id)
    }
  }, [activeItem.key, loadQuestions, onSelectedItemChange])

  // 选择题目
  const handleQuestionSelect = React.useCallback((question: Question) => {
    setSelectedQuestion(question)
    onSelectedItemChange?.('question', question.id)
  }, [onSelectedItemChange])

  // 初始加载
  React.useEffect(() => {
    handleMenuItemClick(navMain[0])
  }, [handleMenuItemClick])

  // 搜索防抖
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (activeItem.key === 'organizations') {
        loadOrganizations()
      } else if (activeItem.key === 'exams') {
        loadExams(selectedOrganization?.id)
      } else if (activeItem.key === 'questions') {
        loadQuestions(selectedExam?.id, selectedOrganization?.id)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, activeItem.key, selectedOrganization?.id, selectedExam?.id, loadOrganizations, loadExams, loadQuestions])

  // 获取当前列表数据
  const getCurrentListData = () => {
    switch (activeItem.key) {
      case 'organizations':
        return organizations
      case 'exams':
        return exams
      case 'questions':
        return questions
      default:
        return []
    }
  }

  // 渲染列表项
  const renderListItem = (item: Organization | Exam | Question) => {
    const isOrg = 'organizationCode' in item
    const isExam = 'examCode' in item
    const isQuestion = 'questionCode' in item

    let title = ''
    let subtitle = ''
    let description = ''

    if (isOrg) {
      const org = item as Organization
      title = org.name
      subtitle = org.organizationCode
      description = org.description || org.region || ''
    } else if (isExam) {
      const exam = item as Exam
      title = exam.name
      subtitle = exam.examCode
      description = `${exam.examType} | ${exam.gradeLevel} | ${exam.totalQuestions}题`
    } else if (isQuestion) {
      const question = item as Question
      title = question.questionText.substring(0, 50) + (question.questionText.length > 50 ? '...' : '')
      subtitle = question.questionCode
      description = `${question.subject} | ${question.questionType} | ${question.difficultyLevel}`
    }

    const handleClick = () => {
      if (isOrg) {
        handleOrganizationSelect(item as Organization)
      } else if (isExam) {
        handleExamSelect(item as Exam)
      } else if (isQuestion) {
        handleQuestionSelect(item as Question)
      }
    }

    const isSelected = 
      (isOrg && selectedOrganization?.id === item.id) ||
      (isExam && selectedExam?.id === item.id) ||
      (isQuestion && selectedQuestion?.id === item.id)

    return (
      <div
        key={item.id}
        onClick={handleClick}
        className={`hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight cursor-pointer last:border-b-0 ${
          isSelected ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
        }`}
      >
        <div className="flex w-full items-center gap-2">
          <span className="font-medium truncate flex-1">{title}</span>
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        </div>
        <span className="text-xs text-muted-foreground line-clamp-2 w-full">
          {description}
        </span>
      </div>
    )
  }

  return (
    <Sidebar
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row w-100"
      {...props}
    >
      {/* 第一栏：主导航菜单 */}
      <Sidebar
        collapsible="none"
        className="w-32 border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="#">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <BookOpen className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">墨灵·刷题</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navMain.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: true,
                      }}
                      onClick={() => handleMenuItemClick(item)}
                      isActive={activeItem?.key === item.key}
                      className="justify-start gap-3 px-3"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={userData} />
        </SidebarFooter>
      </Sidebar>

      {/* 第二栏：列表显示 */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-foreground text-base font-medium">
              {activeItem?.title}
            </div>
            <Label className="flex items-center gap-2 text-sm">
              <span>总数</span>
              <span className="bg-sidebar-accent text-sidebar-accent-foreground px-2 py-1 rounded text-xs">
                {getCurrentListData().length}
              </span>
            </Label>
          </div>
          <SidebarInput 
            placeholder={`搜索${activeItem?.title}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0 mt-[-8]">
            <SidebarGroupContent>
              {loading ? (
                <div className="p-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="border-b last:border-b-0 p-4">
                      <div className="flex w-full items-center gap-2 mb-2">
                        <Skeleton className="h-4 w-1/2 flex-1" />
                        <Skeleton className="h-3 w-24 ml-auto" />
                      </div>
                      <Skeleton className="h-3 w-5/6" />
                    </div>
                  ))}
                </div>
              ) : getCurrentListData().length === 0 ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-sm text-muted-foreground">暂无数据</div>
                </div>
              ) : (
                getCurrentListData().map(renderListItem)
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
}
