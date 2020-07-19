import moment from 'moment'
import { combineLatest, map } from 'rxjs/operators'
import CommentRepository from '@/repositories/CommentRepository'
import PresentationRepository from '@/repositories/PresentationRepository'
import StampRepository from '@/repositories/StampRepository'
import UserRepository from '@/repositories/UserRepository'

export default {
  get (id, loginUser) {
    return PresentationRepository.get(id)
      .pipe(combineLatest(UserRepository.getAll(), CommentRepository.getAll(id), StampRepository.getAll()))
      .pipe(map(([presentation, users, comments, stamps]) => {
        presentation.presenter = users.find((u) => u.id === presentation.presenter.id)
        const convertedComments = convertComment(comments, loginUser, users, presentation.presenter.id)
        return [presentation, convertedComments, stamps]
      }))
  }
}

function convertComment (comments, loginUser, users, presenterId) {
  /**
   * userRef：削除されたユーザーの場合でもオブジェクトで参照できるようにデフォルト値を設定
   * isEditable：ログインユーザーがそのコメントを編集できるかどうか（投稿者のみが編集可能）
   * isDeletable：ログインユーザーがそのコメントを削除できるかどうか（管理者または投稿者が削除可能）
   * canShow：ログインユーザがそのコメントを閲覧できるかどうか（ダイレクトコメント投稿者、発表者、管理者のみ閲覧可能）
   */
  return comments.map((comment) => {
    const userRef = comment.userRef
      ? users.find((u) => u.id === comment.userRef.id)
      : {
        photoURL: null,
        name: null
      }
    const isCommentedUser = userRef.id === loginUser.id
    const isPresenter = presenterId === loginUser.id
    return {
      ...comment,
      userRef,
      postedAt: comment.postedAt.toDate(),
      isEditable: isCommentedUser,
      isDeletable: loginUser.isAdmin || isCommentedUser,
      canShow: !comment.isDirect || loginUser.isAdmin || isCommentedUser || isPresenter
    }
  })
    .filter((cm) => cm.canShow)
    .sort((a, b) => {
      // 投稿日時の昇順にソート
      // NOTE: 取得時にorderByで指定するにはindexが必要となるのでここでソートしている
      return !moment(a.postedAt).isSame(b.postedAt)
        ? (moment(a.postedAt).isAfter(b.postedAt) ? -1 : 1)
        : 0
    })
}
